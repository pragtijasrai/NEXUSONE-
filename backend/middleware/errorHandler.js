import { ZodError } from 'zod';
export function notFound(req, res) { res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } }); }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid request', details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) } });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: { code: err.code || 'ERROR', message: status === 500 ? 'Internal server error' : err.message } });
}
