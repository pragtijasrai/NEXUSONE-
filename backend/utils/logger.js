/**
 * Structured logging with pino.
 *
 * In development we use pino-pretty for human-readable output.
 * In production we emit newline-delimited JSON so a log aggregator
 * (e.g. Loki, Elasticsearch) can ingest it without parsing.
 *
 * We NEVER log:
 *   - Passwords or password hashes
 *   - JWT tokens or refresh tokens
 *   - Database connection strings
 *   - Any other secrets
 *
 * Syllabus connection:
 *   - Centralized logging (Syllabus I — Debugging, Logging, Code Quality)
 */

import pino from 'pino';
import { env } from '../config/env.js';

const isDev = env.nodeEnv === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

export default logger;
