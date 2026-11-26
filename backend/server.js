/**
 * Server entry point.
 * - Creates HTTP server from Express app
 * - Attaches Socket.IO for real-time events
 * - Handles graceful shutdown
 */

import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { logger } from './utils/logger.js';
import { initSocket } from './sockets/index.js';

const httpServer = createServer(app);

/* Attach Socket.IO to the HTTP server */
initSocket(httpServer);

/* ── Scheduled maintenance jobs ── */
import { purgeExpired as purgeRefreshTokens } from './models/tokenModel.js';

async function runMaintenanceJobs() {
  try {
    await purgeRefreshTokens();
  } catch { /* non-fatal */ }
}

/* Run once on start, then every 6 hours */
runMaintenanceJobs();
setInterval(runMaintenanceJobs, 6 * 60 * 60 * 1000);

httpServer.listen(env.port, () => {
  logger.info(`NexusOne API listening on http://localhost:${env.port}/api/v1`);
  logger.info(`Socket.IO ready on ws://localhost:${env.port}`);
});

/* ── Graceful shutdown ── */
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully...`);
  httpServer.close(() => { logger.info('HTTP server closed.'); });
  try { await pool.end(); logger.info('Database pool closed.'); } catch { /* already closed */ }
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => { logger.error({ err }, 'Unhandled promise rejection'); });
process.on('uncaughtException',  (err) => { logger.error({ err }, 'Uncaught exception'); process.exit(1); });
