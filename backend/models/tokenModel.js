/**
 * Token model — refresh tokens stored in the database.
 *
 * Why store refresh tokens in the DB instead of just using long-lived JWTs?
 *   - A JWT cannot be invalidated before it expires (it's stateless).
 *   - Storing a hash of the refresh token lets us revoke it immediately
 *     (on logout, on password change, on suspicious activity).
 *   - We store a HASH (SHA-256), not the raw token — so even if the
 *     database is compromised, the raw tokens are not exposed.
 *
 * The actual refresh token is a random 48-byte hex string generated in
 * authService.js and sent to the client once. We never store the raw token.
 *
 * Syllabus:
 *   - JWT / token security (Syllabus D)
 *   - Parameterized SQL (Syllabus D & H)
 */

import { createHash } from 'crypto';
import { query } from '../config/db.js';

/** Hash a raw token before storing/looking up — we never store raw tokens */
export const hashToken = (raw) => createHash('sha256').update(raw).digest('hex');

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

/** Revoke all refresh tokens for a user — used on password change or logout-all */
export const revokeAll = async (userId) =>
  query(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId],
  );

/** Clean up expired tokens — can be run by a scheduled job */
export const purgeExpired = async () =>
  query(`DELETE FROM refresh_tokens WHERE expires_at < now()`);
