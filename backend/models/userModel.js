import { query } from '../config/db.js';
const cols = 'id, name, email, role, status, created_at';
export const findByEmail = async (email) => (await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])).rows[0];
export const create = async ({ name, email, passwordHash, role }) =>
  (await query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING ${cols}`, [name, email.toLowerCase(), passwordHash, role])).rows[0];
