/**
 * Auth service — authentication + password reset business logic.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env, isDev } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import * as users from '../models/userModel.js';
import * as tokens from '../models/tokenModel.js';
import { sendPasswordReset } from './emailService.js';
import { logger } from '../utils/logger.js';

/* ── JWT helpers ── */
const signAccess = (u) =>
  jwt.sign({ sub: u.id, role: u.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESET_TTL_MINUTES = 30;

const publicUser = ({ id, name, email, role, status }) => ({ id, name, email, role, status });

const ALLOWED_DOMAIN = 'chitkara.edu.in';
const assertChitkaraDomain = (email) => {
  if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`))
    throw new AppError(400, `Only @${ALLOWED_DOMAIN} email addresses are allowed`, 'INVALID_DOMAIN');
};

/* ── Register ── */
export async function register({ name, email, password, role }) {
  assertChitkaraDomain(email);
  const safeRole = ['student','faculty'].includes(role) ? role : 'student';
  if (await users.findByEmail(email)) throw new AppError(409, 'Email already registered', 'EMAIL_TAKEN');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await users.create({ name, email, role: safeRole, passwordHash });

  /* ── Auto-create role-specific profile ── */
  try {
    const { query } = await import('../config/db.js');
    if (safeRole === 'student') {
      await query(
        `INSERT INTO students (user_id, roll_number, semester, enrollment_year)
         VALUES ($1, $2, 5, 2024)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, `CU-S-${user.id}`]
      );
    } else if (safeRole === 'faculty') {
      await query(
        `INSERT INTO faculty (user_id, employee_id, designation)
         VALUES ($1, $2, 'Faculty')
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, `CU-F-${user.id}`]
      );
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'Could not create role profile after registration');
    /* Non-fatal — the fix_faculty_profiles migration handles cleanup */
  }

  const accessToken = signAccess(user);
  const raw = generateRefreshToken();
  await tokens.create({ userId: user.id, raw, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) });
  return { user: publicUser(user), accessToken, refreshToken: raw };
}

/* ── Login ── */
export async function login({ email, password }) {
  assertChitkaraDomain(email);
  const user = await users.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    throw new AppError(401, 'Invalid email or password', 'BAD_CREDENTIALS');
  if (user.status !== 'active') throw new AppError(403, 'Account is deactivated', 'DEACTIVATED');
  const accessToken = signAccess(user);
  const raw = generateRefreshToken();
  await tokens.create({ userId: user.id, raw, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) });
  return { user: publicUser(user), accessToken, refreshToken: raw };
}

/* ── Refresh ── */
export async function refresh(raw) {
  if (!raw) throw new AppError(401, 'Refresh token required', 'UNAUTHENTICATED');
  const tokenRow = await tokens.findValid(raw);
  if (!tokenRow) throw new AppError(401, 'Invalid or expired refresh token', 'UNAUTHENTICATED');
  if (tokenRow.status !== 'active') throw new AppError(403, 'Account is deactivated', 'DEACTIVATED');
  await tokens.revoke(raw);
  const newRaw = generateRefreshToken();
  await tokens.create({ userId: tokenRow.user_id, raw: newRaw, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) });
  const user = await users.findById(tokenRow.user_id);
  return { accessToken: signAccess(user), refreshToken: newRaw };
}

/* ── Logout ── */
export async function logout(raw) {
  if (raw) await tokens.revoke(raw);
}

/* ── Update profile ── */
export async function updateProfile(userId, fields) {
  const user = await users.updateProfile(userId, fields);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  return publicUser(user);
}

/* ── Change password ── */
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await users.findById(userId);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  if (!(await bcrypt.compare(currentPassword, user.password_hash)))
    throw new AppError(401, 'Current password is incorrect', 'BAD_CREDENTIALS');
  await users.updatePassword(userId, await bcrypt.hash(newPassword, 12));
  await tokens.revokeAll(userId);
}

/* ── Forgot password ── */
export async function forgotPassword({ email }) {
  /* ALWAYS return success to prevent account enumeration.
     Any error (including DB unavailability in test mode) is silently swallowed. */
  try {
    const user = await users.findByEmail(email);
    if (!user || user.status !== 'active') return { sent: true };

    const raw = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
    await tokens.createResetToken({ userId: user.id, raw, expiresAt });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl    = `${frontendUrl}/reset-password?token=${raw}`;

    await sendPasswordReset({ to: user.email, name: user.name, resetUrl, expiresInMinutes: RESET_TTL_MINUTES });

    return {
      sent: true,
      ...(isDev && !env.smtpHost ? { devToken: raw, devResetUrl: resetUrl } : {}),
    };
  } catch (err) {
    /* DB error or any other failure — still return success (anti-enumeration).
       Log at warn level so ops can spot unusual error patterns. */
    logger.warn({ err: err?.message }, 'forgotPassword suppressed error (anti-enumeration)');
    return { sent: true };
  }
}

/* ── Reset password ── */
export async function resetPassword({ token, password }) {
  /* findValidResetToken can fail if DB is down — wrap it */
  let tokenRow;
  try {
    tokenRow = await tokens.findValidResetToken(token);
  } catch {
    throw new AppError(400, 'Invalid or expired reset token. Please request a new one.', 'INVALID_TOKEN');
  }

  if (!tokenRow)
    throw new AppError(400, 'Invalid or expired reset token. Please request a new one.', 'INVALID_TOKEN');

  const user = await users.findById(tokenRow.user_id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  await users.updatePassword(user.id, await bcrypt.hash(password, 12));
  await tokens.revokeAll(user.id);
  /* revokeAllResetTokens marks ALL unused tokens (including this one) as used — single call is sufficient */
  await tokens.revokeAllResetTokens(user.id);

  return { userId: user.id, email: user.email };
}
