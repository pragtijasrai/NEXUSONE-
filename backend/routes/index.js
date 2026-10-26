import { Router } from 'express';
import { dbHealthy } from '../config/db.js';
import authRoutes         from './authRoutes.js';
import userRoutes         from './userRoutes.js';
import roomRoutes         from './roomRoutes.js';
import bookingRoutes      from './bookingRoutes.js';
import eventRoutes        from './eventRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import ticketRoutes       from './ticketRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes    from './dashboardRoutes.js';

const r = Router();

/* ── Health ── */
r.get('/health', async (req, res) => {
  const dbOk = await dbHealthy();
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      status:      dbOk ? 'ok' : 'degraded',
      service:     'nexusone-backend',
      database:    dbOk ? 'up' : 'down',
      time:        new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/* ── Mounted routes ── */
r.use('/auth',          authRoutes);
r.use('/users',         userRoutes);
r.use('/rooms',         roomRoutes);
r.use('/bookings',      bookingRoutes);
r.use('/events',        eventRoutes);
r.use('/announcements', announcementRoutes);
r.use('/maintenance',   ticketRoutes);
r.use('/notifications', notificationRoutes);
r.use('/dashboard',     dashboardRoutes);

export default r;
