/**
 * Express application setup — production-ready configuration.
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

/* ── Trust proxy (required when behind Render/Railway/Nginx reverse proxy) ── */
if (isProd) {
  app.set('trust proxy', 1);
}

/* ── Security headers ── */
app.use(helmet());

/* ── CORS ── */
app.use(cors({
  origin: (origin, cb) => {
    /* Allow requests with no origin (curl, Postman, server-to-server) */
    if (!origin) return cb(null, true);
    /* Allow if origin is in the configured list */
    if (env.corsOrigin.includes(origin) || env.corsOrigin.includes('*')) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

/* ── Body parsing ── */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/* ── Structured request logging (suppress in test mode to keep output clean) ── */
if (!isTest) {
  app.use(pinoHttp({ logger }));
}

/* ── Dev-only human-readable logging ── */
if (!isProd && !isTest) {
  app.use(morgan('dev'));
}

/* ── Rate limiting on all API routes ── */
app.use('/api/v1', apiLimiter);

/* ── API routes (versioned) ── */
app.use('/api/v1', routes);

/* ── Legacy /api prefix ── */
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API has moved. Use /api/v1${req.url} instead.`,
    errors: [{ code: 'NOT_FOUND' }],
  });
});

/* ── 404 handler ── */
app.use(notFound);

/* ── Centralized error handler (must be last) ── */
app.use(errorHandler);

export default app;
