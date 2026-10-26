import { query } from '../config/db.js';
import { asyncHandler } from '../utils/AppError.js';

/* ── Student dashboard ── */
export const studentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const [bookingsRes, ticketsRes, eventsRes, announcementsRes, roomsRes] = await Promise.all([
    /* My upcoming bookings */
    query(
      `SELECT rb.id, rb.start_time, rb.end_time, rb.purpose, rb.status,
              r.name AS room_name, r.room_code, r.building
       FROM room_bookings rb JOIN rooms r ON r.id = rb.room_id
       WHERE rb.user_id = $1 AND rb.status = 'confirmed' AND rb.start_time >= now()
       ORDER BY rb.start_time ASC LIMIT 5`,
      [userId],
    ),
    /* My open tickets */
    query(
      `SELECT id, location, issue, priority, status, created_at
       FROM maintenance_tickets WHERE created_by = $1 AND status NOT IN ('resolved','closed')
       ORDER BY created_at DESC LIMIT 5`,
      [userId],
    ),
    /* Upcoming events */
    query(
      `SELECT e.id, e.title, e.event_date, e.location, e.category,
              EXISTS(SELECT 1 FROM event_registrations WHERE event_id=e.id AND user_id=$1) AS registered,
              e.capacity,
              (SELECT COUNT(*) FROM event_registrations WHERE event_id=e.id) AS registrations
       FROM events e WHERE e.event_date >= now()
       ORDER BY e.event_date ASC LIMIT 6`,
      [userId],
    ),
    /* Announcements for students */
    query(
      `SELECT id, title, body, category, priority, created_at
       FROM announcements WHERE status='published' AND audience IN ('all','students')
       ORDER BY created_at DESC LIMIT 5`,
      [],
    ),
    /* Available rooms count */
    query(
      `SELECT COUNT(*) FROM rooms WHERE is_active=true`,
      [],
    ),
  ]);

  res.json({
    success: true,
    message: 'Student dashboard data',
    data: {
      upcomingBookings:  bookingsRes.rows,
      openTickets:       ticketsRes.rows,
      upcomingEvents:    eventsRes.rows,
      announcements:     announcementsRes.rows,
      availableRooms:    Number(roomsRes.rows[0].count),
    },
  });
});

/* ── Faculty dashboard ── */
export const facultyDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const [bookingsRes, announcementsRes, eventsRes, statsRes] = await Promise.all([
    query(
      `SELECT rb.id, rb.start_time, rb.end_time, rb.purpose, rb.status,
              r.name AS room_name, r.room_code
       FROM room_bookings rb JOIN rooms r ON r.id = rb.room_id
       WHERE rb.user_id=$1 AND rb.status='confirmed' AND rb.start_time>=now()
       ORDER BY rb.start_time ASC LIMIT 5`,
      [userId],
    ),
    query(
      `SELECT id, title, body, category, priority, created_at FROM announcements
       WHERE status='published' AND audience IN ('all','faculty')
       ORDER BY created_at DESC LIMIT 5`,
      [],
    ),
    query(
      `SELECT e.id, e.title, e.event_date, e.location, e.category
       FROM events e WHERE e.event_date>=now() ORDER BY e.event_date ASC LIMIT 4`,
      [],
    ),
    query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE role='student' AND status='active') AS total_students,
         (SELECT COUNT(*) FROM rooms WHERE is_active=true) AS available_rooms,
         (SELECT COUNT(*) FROM events WHERE event_date>=now()) AS upcoming_events,
         (SELECT COUNT(*) FROM announcements WHERE status='published' AND audience IN ('all','faculty') AND created_at > now()-interval '7 days') AS recent_announcements`,
      [],
    ),
  ]);

  res.json({
    success: true,
    message: 'Faculty dashboard data',
    data: {
      upcomingBookings:    bookingsRes.rows,
      announcements:       announcementsRes.rows,
      upcomingEvents:      eventsRes.rows,
      stats:               statsRes.rows[0],
    },
  });
});

/* ── Admin dashboard ── */
export const adminDashboard = asyncHandler(async (req, res) => {
  const [statsRes, userDistRes, roomUtilRes, recentUsersRes, ticketsRes] = await Promise.all([
    query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE status='active') AS total_users,
         (SELECT COUNT(*) FROM users WHERE role='student' AND status='active') AS students,
         (SELECT COUNT(*) FROM users WHERE role='faculty' AND status='active') AS faculty,
         (SELECT COUNT(*) FROM users WHERE role='admin' AND status='active') AS admins,
         (SELECT COUNT(*) FROM users WHERE role='maintenance' AND status='active') AS maintenance,
         (SELECT COUNT(*) FROM rooms WHERE is_active=true) AS total_rooms,
         (SELECT COUNT(*) FROM room_bookings WHERE status='confirmed' AND start_time::date=CURRENT_DATE) AS rooms_booked_today,
         (SELECT COUNT(*) FROM maintenance_tickets WHERE status NOT IN ('resolved','closed')) AS open_tickets,
         (SELECT COUNT(*) FROM events WHERE event_date>=now()) AS upcoming_events`,
      [],
    ),
    query(
      `SELECT role, COUNT(*) as count FROM users WHERE status='active' GROUP BY role`,
      [],
    ),
    query(
      `SELECT TO_CHAR(start_time,'Dy') AS day,
              COUNT(*) AS bookings
       FROM room_bookings
       WHERE start_time >= now() - interval '7 days'
       GROUP BY TO_CHAR(start_time,'Dy'), EXTRACT(DOW FROM start_time)
       ORDER BY EXTRACT(DOW FROM start_time)`,
      [],
    ),
    query(
      `SELECT id, name, email, role, status, created_at FROM users
       ORDER BY created_at DESC LIMIT 10`,
      [],
    ),
    query(
      `SELECT id, location, issue, priority, status, created_at FROM maintenance_tickets
       WHERE status NOT IN ('resolved','closed')
       ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END LIMIT 5`,
      [],
    ),
  ]);

  res.json({
    success: true,
    message: 'Admin dashboard data',
    data: {
      stats:       statsRes.rows[0],
      usersByRole: userDistRes.rows,
      roomUtilByDay: roomUtilRes.rows,
      recentUsers: recentUsersRes.rows,
      urgentTickets: ticketsRes.rows,
    },
  });
});

/* ── Maintenance dashboard ── */
export const maintenanceDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const staffRow = (await query(`SELECT id FROM maintenance_staff WHERE user_id=$1`, [userId])).rows[0];
  const staffId  = staffRow?.id;

  const [statsRes, myTicketsRes, allOpenRes] = await Promise.all([
    query(
      `SELECT
         (SELECT COUNT(*) FROM maintenance_tickets WHERE status='open') AS open_tickets,
         (SELECT COUNT(*) FROM maintenance_tickets WHERE status='in_progress') AS in_progress,
         (SELECT COUNT(*) FROM maintenance_tickets WHERE status='resolved' AND resolved_at::date=CURRENT_DATE) AS resolved_today,
         (SELECT COUNT(*) FROM maintenance_tickets WHERE status NOT IN ('resolved','closed')) AS total_active`,
      [],
    ),
    staffId
      ? query(
          `SELECT t.id, t.location, t.issue, t.priority, t.status, t.created_at, u.name AS reporter
           FROM maintenance_tickets t JOIN users u ON u.id=t.created_by
           WHERE t.assigned_to=$1 AND t.status NOT IN ('resolved','closed')
           ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 ELSE 3 END LIMIT 10`,
          [staffId],
        )
      : { rows: [] },
    query(
      `SELECT t.id, t.location, t.issue, t.priority, t.status, t.created_at, u.name AS reporter
       FROM maintenance_tickets t JOIN users u ON u.id=t.created_by
       WHERE t.status='open'
       ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 ELSE 3 END LIMIT 10`,
      [],
    ),
  ]);

  res.json({
    success: true,
    message: 'Maintenance dashboard data',
    data: {
      stats:      statsRes.rows[0],
      myTickets:  myTicketsRes.rows,
      openQueue:  allOpenRes.rows,
    },
  });
});
