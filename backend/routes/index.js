import { Router } from 'express';
import { dbHealthy } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import authRoutes from './authRoutes.js';
const r = Router();
r.get('/health', async (req, res) => res.json({ status: 'ok', service: 'nexusone-backend', database: (await dbHealthy()) ? 'up' : 'down', time: new Date().toISOString() }));
r.use('/auth', authRoutes);
// Modules not implemented yet: they answer 501 (behind auth) so the API surface is visible and honest.
['users', 'rooms', 'bookings', 'attendance', 'assignments', 'announcements', 'maintenance', 'events', 'lost-found', 'transport', 'notifications']
  .forEach((m) => r.use(`/${m}`, authenticate, (req, res) => res.status(501).json({ error: { code: 'NOT_IMPLEMENTED', message: `${m} module is planned` } })));
export default r;
