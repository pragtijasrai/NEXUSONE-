/**
 * Environment configuration with validation.
 *
 * On startup we read process.env (populated by dotenv from .env) and validate
 * the critical variables. If something required is missing the server will
 * refuse to start — this is intentional. It's better to fail loudly during
 * boot than to discover a missing secret at the first request.
 *
 * Syllabus connection:
 *   - Environment variables (Syllabus A)
 *   - Node.js process & module system  (Syllabus B)
 */

import 'dotenv/config';

/* ── Required variables (server won't start without these) ── */
const required = ['JWT_SECRET', 'DATABASE_URL'];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}.\n` +
    `Copy .env.example to .env and fill in the values.`,
  );
}

export const env = {
  nodeEnv:     process.env.NODE_ENV || 'development',
  port:        Number(process.env.PORT) || 4000,
  corsOrigin:  (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret:   process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};

/* Convenience flags used across the codebase */
export const isProd = env.nodeEnv === 'production';
export const isDev  = env.nodeEnv === 'development';
export const isTest = env.nodeEnv === 'test';
