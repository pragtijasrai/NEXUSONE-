/**
 * Migration runner.
 *
 * Usage:
 *   node migrations/run.js          # apply all pending migrations
 *   node migrations/run.js --status # show which migrations have run
 *
 * How it works:
 *   1. Create a `schema_migrations` table if it doesn't exist.
 *   2. Read every .sql file in this directory (sorted by name).
 *   3. For each file not already recorded, execute it inside a single
 *      dedicated client connection so BEGIN/ROLLBACK are on the same
 *      connection (pool.query() can round-robin across connections).
 *
 * Safe retry guarantee:
 *   - If a migration fails, ROLLBACK fires on the same client.
 *   - The filename is NOT inserted into schema_migrations.
 *   - Re-running migrate will attempt the same file again.
 *   - CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS / CREATE EXTENSION
 *     IF NOT EXISTS are all idempotent, so partial success before a failure
 *     is safe to retry.
 *
 * Note: CREATE EXTENSION must run outside a transaction on some PostgreSQL
 * versions. We run it inside the same transaction here because
 * btree_gist is not a "C language" extension and is safe in transactions
 * on PostgreSQL 9.1+. If you hit "cannot run inside transaction block",
 * install btree_gist manually: psql -c "CREATE EXTENSION btree_gist;"
 *
 * Syllabus connection:
 *   - Database migrations / versioned SQL files (Syllabus E)
 *   - fs module for reading migration files (Syllabus B)
 *   - async/await (Syllabus A)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function getApplied(client) {
  const { rows } = await client.query(
    'SELECT filename FROM schema_migrations ORDER BY filename',
  );
  return new Set(rows.map((r) => r.filename));
}

function getMigrationFiles() {
  return fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function runMigrations() {
  const showStatus = process.argv.includes('--status');

  /* Use a dedicated client so BEGIN/ROLLBACK stay on the same connection */
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const applied = await getApplied(client);
    const files   = getMigrationFiles();
    let pending   = 0;

    for (const file of files) {
      const isApplied = applied.has(file);

      if (showStatus) {
        console.log(`  ${isApplied ? '[x]' : '[ ]'} ${file}`);
        if (!isApplied) pending++;
        continue;
      }

      if (isApplied) continue;

      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      logger.info(`Applying migration: ${file}`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        logger.info(`✓ Applied: ${file}`);
        pending++;
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error({ err }, `✗ Failed: ${file} — rolled back, safe to retry`);
        process.exit(1);
      }
    }

    if (showStatus) {
      console.log(`\n${pending} pending migration(s).`);
    } else if (pending === 0) {
      logger.info('All migrations already applied — nothing to do.');
    } else {
      logger.info(`${pending} migration(s) applied successfully.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  logger.error({ err }, 'Migration runner failed');
  process.exit(1);
});
