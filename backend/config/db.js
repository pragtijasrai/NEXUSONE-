/**
 * PostgreSQL connection pool — production-tuned configuration.
 *
 * Production settings:
 *   - max: 10 connections (Render free tier limits concurrent connections)
 *   - SSL required in production (Render/Railway provide ssl=true)
 *   - connectionTimeoutMillis: 10s (longer for cold starts)
 *   - idleTimeoutMillis: 30s
 */

import pg from 'pg';
import { env, isProd } from './env.js';

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,

  /* SSL required for most cloud Postgres providers */
  ssl: isProd ? { rejectUnauthorized: false } : false,

  max: isProd ? 10 : 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: isProd ? 10_000 : 5_000,
});

export const query = (text, params) => pool.query(text, params);

export async function dbHealthy() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
