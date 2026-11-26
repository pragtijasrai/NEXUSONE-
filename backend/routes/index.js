import { Router } from 'express';
import { dbHealthy, query as dbQuery } from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/AppError.js';
import authRoutes         from './authRoutes.js';
import userRoutes         from './userRoutes.js';
import roomRoutes         from './roomRoutes.js';
import bookingRoutes      from './bookingRoutes.js';
import eventRoutes        from './eventRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import ticketRoutes       from './ticketRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes    from './dashboardRoutes.js';
import lostFoundRoutes     from './lostFoundRoutes.js';
import facultyRoutes       from './facultyRoutes.js';
import assistantRoutes    from './assistantRoutes.js';
import * as ttController   from '../controllers/timetableController.js';

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
r.use('/lost-found',    lostFoundRoutes);
r.use('/notifications', notificationRoutes);
r.use('/dashboard',     dashboardRoutes);
r.use('/faculty',       facultyRoutes);
r.use('/assistant',    assistantRoutes);

/* Timetable endpoints (student-only) */
r.get('/timetable',  authenticate, requireRole('student'), ttController.getTimetable);
r.get('/attendance', authenticate, requireRole('student'), ttController.getAttendance);
r.get('/courses',    authenticate, requireRole('student'), ttController.getCourses);

/* Admin: all courses (read-only) */
r.get('/admin/courses', authenticate, requireRole('admin'), asyncHandler(async (req, res) => {
  const { rows } = await dbQuery(
    `SELECT c.*, d.name AS department_name,
       (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) AS enrolled_count,
       (SELECT COUNT(*) FROM class_sessions cs WHERE cs.course_id = c.id) AS session_count
     FROM courses c
     LEFT JOIN departments d ON d.id = c.department_id
     ORDER BY c.code`
  );
  res.json({ success: true, message: 'Courses retrieved', data: { courses: rows } });
}));

/* Admin: all class sessions */
r.get('/admin/sessions', authenticate, requireRole('admin'), asyncHandler(async (req, res) => {
  const { rows } = await dbQuery(
    `SELECT cs.id, cs.day_of_week, cs.start_time, cs.end_time, cs.created_at,
       c.code AS course_code, c.name AS course_name,
       u.name AS faculty_name,
       r.name AS room_name, r.room_code
     FROM class_sessions cs
     JOIN courses c ON c.id = cs.course_id
     JOIN faculty f ON f.id = cs.faculty_id
     JOIN users u ON u.id = f.user_id
     LEFT JOIN rooms r ON r.id = cs.room_id
     ORDER BY cs.day_of_week, cs.start_time`
  );
  res.json({ success: true, message: 'Sessions retrieved', data: { sessions: rows } });
}));

/* Admin: attendance overview */
r.get('/admin/attendance', authenticate, requireRole('admin'), asyncHandler(async (req, res) => {
  const summary = await dbQuery(
    `SELECT
       c.code AS course_code, c.name AS course_name,
       COUNT(ar.id) AS total,
       COUNT(*) FILTER (WHERE ar.status='present') AS present,
       COUNT(*) FILTER (WHERE ar.status='absent')  AS absent,
       COUNT(*) FILTER (WHERE ar.status='late')    AS late
     FROM courses c
     LEFT JOIN class_sessions cs ON cs.course_id = c.id
     LEFT JOIN attendance_records ar ON ar.class_session_id = cs.id
     GROUP BY c.id, c.code, c.name
     ORDER BY c.code`
  );
  res.json({ success: true, message: 'Attendance overview', data: { summary: summary.rows } });
}));

export default r;
