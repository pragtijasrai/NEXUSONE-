/**
 * Auth service — all authentication business logic.
 *
 * Token strategy (two-token pattern):
 *   - Access token:  short-lived JWT (default 1h), sent in every API request header.
 *   - Refresh token: long-lived random string (30d), stored as a hash in the DB.
 *
 * Why two tokens?
 *   A single long-lived JWT cannot be revoked. If it's stolen, the attacker
 *   has access until it expires. With two tokens:
 *   - The access token is short-lived, so exposure window is small.
 *   - The refresh token can be revoked immediately (logout, password change).
 *   - The frontend silently refreshes the access token using the refresh token
 *     before it expires — the user stays logged in without re-authenticating.
 *
 * Trade-off vs httpOnly cookies:
 *   We're returning tokens in the response body (bearer token strategy) rather
 *   than setting httpOnly cookies. This is simpler to implement with a separate
 *   React frontend and avoids CSRF complexity, but it means the frontend must
 *   store the access token in memory (not localStorage — see frontend notes).
 *   The refresh token is stored in localStorage only for session persistence.
 *
 * Syllabus:
 *   - JWT / token security (Syllabus D)
 *   - Password hashing (Syllabus D)
 *   - Role-based authorization (Syllabus D)
 *   - async/await (Syllabus A)
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import * as users from '../models/userModel.js';
import * as tokens from '../models/tokenModel.js';

/* ── JWT helpers ── */

const signAccess = (u) =>
  jwt.sign({ sub: u.id, role: u.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* ── Public user shape — never includes password_hash ── */
const publicUser = ({ id, name, email, role, status }) => ({ id, name, email, role, status });

const ALLOWED_DOMAIN = 'chitkara.edu.in';

const assertChitkaraDomain = (email) => {
  if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new AppError(400, `Only @${ALLOWED_DOMAIN} email addresses are allowed`, 'INVALID_DOMAIN');
  }
};

/* ── Auth operations ── */

export async function register({ name, email, password, role }) {
  assertChitkaraDomain(email);
  const allowedRoles = ['student', 'faculty'];
  const safeRole = allowedRoles.includes(role) ? role : 'student';

  if (await users.findByEmail(email)) {
    throw new AppError(409, 'Email already registered', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await users.create({ name, email, role: safeRole, passwordHash });

  const accessToken  = signAccess(user);
  const raw          = generateRefreshToken();
  const expiresAt    = new Date(Date.now() + REFRESH_TTL_MS);
  await tokens.create({ userId: user.id, raw, expiresAt });

  return { user: publicUser(user), accessToken, refreshToken: raw };
}

export async function login({ email, password }) {
  assertChitkaraDomain(email);
  const user = await users.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError(401, 'Invalid email or password', 'BAD_CREDENTIALS');
  }

  if (user.status !== 'active') {
    throw new AppError(403, 'Account is deactivated', 'DEACTIVATED');
  }

  const accessToken = signAccess(user);
  const raw         = generateRefreshToken();
  const expiresAt   = new Date(Date.now() + REFRESH_TTL_MS);
  await tokens.create({ userId: user.id, raw, expiresAt });

  return { user: publicUser(user), accessToken, refreshToken: raw };
}

export async function refresh(raw) {
  if (!raw) throw new AppError(401, 'Refresh token required', 'UNAUTHENTICATED');

  const tokenRow = await tokens.findValid(raw);
  if (!tokenRow) throw new AppError(401, 'Invalid or expired refresh token', 'UNAUTHENTICATED');
  if (tokenRow.status !== 'active') throw new AppError(403, 'Account is deactivated', 'DEACTIVATED');

  /* Rotate: revoke the used token and issue a new one */
  await tokens.revoke(raw);
  const newRaw      = generateRefreshToken();
  const expiresAt   = new Date(Date.now() + REFRESH_TTL_MS);
  await tokens.create({ userId: tokenRow.user_id, raw: newRaw, expiresAt });

  const user = await users.findById(tokenRow.user_id);
  return {
    accessToken:  signAccess(user),
    refreshToken: newRaw,
  };
}

export async function logout(raw) {
  if (raw) await tokens.revoke(raw);
  /* If no refresh token provided (e.g. access-token-only client), that's fine */
}

export async function updateProfile(userId, fields) {
  const user = await users.updateProfile(userId, fields);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  return publicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await users.findById(userId);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new AppError(401, 'Current password is incorrect', 'BAD_CREDENTIALS');

  const hash = await bcrypt.hash(newPassword, 12);
  await users.updatePassword(userId, hash);

  /* Revoke all existing refresh tokens — forces re-login on other devices */
  await tokens.revokeAll(userId);
}
