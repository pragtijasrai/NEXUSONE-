/**
 * User model — all SQL queries for the users table.
 *
 * This is the repository layer. It only talks to the database and returns
 * plain JavaScript objects. No business logic lives here — just SQL.
 *
 * Every query uses parameterized placeholders ($1, $2 …) to prevent
 * SQL injection. Never concatenate user input into a query string.
 *
 * Syllabus:
 *   - Parameterized SQL / SQL injection prevention (Syllabus D & H)
 *   - Asynchronous DB queries with async/await (Syllabus A)
 *   - Separation of concerns: model vs service (Syllabus C)
 */

import { query } from '../config/db.js';

/* Columns safe to return to the client — password_hash is always excluded */
const PUBLIC_COLS = 'id, name, email, role, status, created_at, updated_at';

/* All columns — used internally when we need password_hash for comparison */
const ALL_COLS = `id, name, email, role, status, password_hash, created_at, updated_at`;

/* ── Reads ── */

export const findById = async (id) =>
  (await query(`SELECT ${ALL_COLS} FROM users WHERE id = $1`, [id])).rows[0];

export const findByEmail = async (email) =>
  (await query(`SELECT ${ALL_COLS} FROM users WHERE email = $1`, [email.toLowerCase()])).rows[0];

/**
 * Paginated list of users — for admin user management.
 * Only allowed columns can be used for sorting (prevents SQL injection via
 * dynamic ORDER BY).
 */
const ALLOWED_SORT_COLS = new Set(['name', 'email', 'role', 'status', 'created_at']);

export async function findAll({ page = 1, limit = 20, role, status, search, sortBy = 'created_at', sortDir = 'DESC' } = {}) {
  const safeSort = ALLOWED_SORT_COLS.has(sortBy) ? sortBy : 'created_at';
  const safeDir  = sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const params = [];
  const where  = [];

  if (role)   { params.push(role);   where.push(`role = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  /* Count total matching rows for pagination metadata */
  const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
  const total = Number(countResult.rows[0].count);

  /* Paginated rows */
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT ${PUBLIC_COLS} FROM users ${whereClause}
     ORDER BY ${safeSort} ${safeDir}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/* ── Writes ── */

export const create = async ({ name, email, passwordHash, role }) =>
  (await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLS}`,
    [name, email.toLowerCase(), passwordHash, role],
  )).rows[0];

export const updateProfile = async (id, { name, phone, avatar_url }) =>
  (await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         phone = COALESCE($3, phone),
         avatar_url = COALESCE($4, avatar_url),
         updated_at = now()
     WHERE id = $1
     RETURNING ${PUBLIC_COLS}`,
    [id, name, phone, avatar_url],
  )).rows[0];

export const updatePassword = async (id, passwordHash) =>
  (await query(
    `UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`,
    [id, passwordHash],
  ));

export const updateStatus = async (id, status) =>
  (await query(
    `UPDATE users SET status = $2, updated_at = now() WHERE id = $1 RETURNING ${PUBLIC_COLS}`,
    [id, status],
  )).rows[0];

export const updateRole = async (id, role) =>
  (await query(
    `UPDATE users SET role = $2, updated_at = now() WHERE id = $1 RETURNING ${PUBLIC_COLS}`,
    [id, role],
  )).rows[0];

export const remove = async (id) =>
  query(`DELETE FROM users WHERE id = $1`, [id]);
