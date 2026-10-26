/**
 * Express application setup.
 *
 * This file configures the Express app (middleware, routes, error handlers)
 * but does NOT start the server. server.js imports this app and calls listen().
 * This separation makes the app easy to test — tests can import `app` and
 * call it without binding to a port.
 *
 * Middleware order matters:
 *   1. helmet   → security headers (first, before any response)
 *   2. cors    → CORS handling
 *   3. express.json → body parsing
 *   4. pinoHttp → request logging
 *   5. morgan  → dev-only HTTP logging
 *   6. rate limiter → protect against abuse
 *   7. routes   → API endpoints
 *   8. notFound → 404 for unmatched routes
 *   9. errorHandler → catch-all error handler (must be last)
 *
 * Syllabus:
 *   - Express setup & middleware (Syllabus C)
 *   - API versioning /api/v1 (Syllabus C)
 *   - Security middleware (Syllabus D & H)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { env, isProd, isTest } from './config/env.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

/* ── Security headers ── */
app.use(helmet());

/* ── CORS — only allow the configured frontend origin(s) ── */
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,  // needed if we switch to httpOnly cookies later
}));

/* ── Body parsing ── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ── Structured request logging ── */
app.use(pinoHttp({ logger }));

/* ── Dev-only HTTP logging (human-readable, good for debugging) ── */
if (!isProd && !isTest) {
  app.use(morgan('dev'));
}

/* ── Rate limiting on all API routes ── */
app.use('/api/v1', apiLimiter);

/* ── API routes (versioned) ── */
app.use('/api/v1', routes);

/* ── Legacy /api prefix — simple 404 with a helpful message ── */
// We cannot use a redirect here: /api/v1 starts with /api so Express
// would match /api/v1/... routes here too, causing an infinite redirect loop.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API has moved. Use /api/v1${req.url} instead.`,
    errors: [{ code: 'NOT_FOUND' }],
  });
});

/* ── 404 handler (must come after routes) ── */
app.use(notFound);

/* ── Centralized error handler (must be last) ── */
app.use(errorHandler);

export default app;
