import pg from 'pg';
import { env } from './env.js';
// Pool connects lazily, so the server (and /api/health) starts without a database.
export const pool = new pg.Pool({ connectionString: env.databaseUrl });
export const query = (text, params) => pool.query(text, params);
export async function dbHealthy() { try { await pool.query('SELECT 1'); return true; } catch { return false; } }
