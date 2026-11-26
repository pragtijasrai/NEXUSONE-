/**
 * Token model — refresh tokens + password reset tokens.
 *
 * Both token types store a SHA-256 hash — raw tokens are never persisted.
 */

import { createHash } from 'crypto';
import { query } from '../config/db.js';

/** Hash a raw token before storing/looking up — we never store raw tokens */
export const hashToken = (raw) => createHash('sha256').update(raw).digest('hex');

/* ── Refresh tokens ── */

export const create = async ({ userId, raw, expiresAt }) =>
  (await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, hashToken(raw), expiresAt],
  )).rows[0];

export const findValid = async (raw) =>
  (await query(
    `SELECT rt.*, u.id AS user_id, u.role, u.status
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1
       AND rt.revoked_at IS NULL
       AND rt.expires_at > now()`,
    [hashToken(raw)],
  )).rows[0];

export const revoke = async (raw) =>
  query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`,
    [hashToken(raw)],
  );

export const revokeAll = async (userId) =>
  query(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId],
  );

export const purgeExpired = async () =>
  query(`DELETE FROM refresh_tokens WHERE expires_at < now()`);

/* ── Password reset tokens ── */

export const createResetToken = async ({ userId, raw, expiresAt }) =>
  (await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, hashToken(raw), expiresAt],
  )).rows[0];

/**
 * Find a valid, unused, non-expired reset token.
 * Returns the row (including user_id) or undefined.
 */
export const findValidResetToken = async (raw) =>
  (await query(
    `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at
     FROM password_reset_tokens prt
     WHERE prt.token_hash = $1
       AND prt.used_at    IS NULL
       AND prt.expires_at > now()`,
    [hashToken(raw)],
  )).rows[0];

/** Mark a reset token as used (single-use guarantee) */
export const markResetTokenUsed = async (id) =>
  query(
    `UPDATE password_reset_tokens SET used_at = now() WHERE id = $1`,
    [id],
  );

/** Revoke all unused reset tokens for a user (e.g., after successful reset) */
export const revokeAllResetTokens = async (userId) =>
  query(
    `UPDATE password_reset_tokens SET used_at = now()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );
