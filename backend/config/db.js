/**
 * PostgreSQL connection pool.
 *
 * pg.Pool keeps a set of reusable connections to the database. The pool
 * connects lazily — calling `new pg.Pool()` does NOT immediately open a
 * connection, so the Express server can start even if PostgreSQL isn't
 * running yet. This lets the /api/v1/health endpoint report "database: down"
 * instead of crashing the entire server.
 *
 * All queries use parameterized placeholders ($1, $2, ...) — user input
 * is never concatenated into SQL strings. This is our primary defense
 * against SQL injection (Syllabus D — Security).
 *
 * Syllabus connection:
 *   - Asynchronous database queries (Syllabus A)
 *   - Node.js modules & require/import (Syllabus B)
 */

import pg from 'pg';
import { env } from './env.js';

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,

  /* Production tuning — these defaults are fine for development */
  max: env.nodeEnv === 'production' ? 20 : 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

/** Shorthand for pool.query — every model uses this. */
export const query = (text, params) => pool.query(text, params);

/**
 * Lightweight health check: SELECT 1.
 * Returns true/false so the health endpoint can report DB status
 * without leaking connection details.
 */
export async function dbHealthy() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a callback inside a transaction.
 *
 * Usage:
 *   const result = await withTransaction(async (client) => {
 *     await client.query('INSERT ...', [...]);
 *     await client.query('UPDATE ...', [...]);
 *     return something;
 *   });
 *
 * If the callback throws, the transaction is rolled back automatically.
 * This is how we'll handle room bookings (Phase 5) and attendance
 * recording (Phase 7) safely.
 */
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
