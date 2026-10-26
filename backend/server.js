/**
 * Server entry point.
 *
 * Starts the HTTP server and handles graceful shutdown:
 *   - SIGINT  (Ctrl+C in terminal)
 *   - SIGTERM (from process manager or OS)
 *
 * Graceful shutdown means:
 *   1. Stop accepting new connections
 *   2. Wait for in-flight requests to finish
 *   3. Close the database pool
 *   4. Exit cleanly
 *
 * This prevents corrupted database transactions and resource leaks.
 *
 * Syllabus:
 *   - Graceful server shutdown (Syllabus B & I)
 *   - Node.js process & events (Syllabus B)
 *   - Events and EventEmitter (SIGINT/SIGTERM are Node.js events)
 */

import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.port, () => {
  logger.info(`NexusOne API listening on http://localhost:${env.port}/api/v1`);
});

/* ── Graceful shutdown ── */
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed.');
  });

  try {
    await pool.end();
    logger.info('Database pool closed.');
  } catch {
    // Pool might already be closed — that's fine
  }

  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

/* ── Catch unhandled errors so the process doesn't crash silently ── */
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});
