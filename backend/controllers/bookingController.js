import * as bookings from '../models/bookingModel.js';
import * as rooms from '../models/roomModel.js';
import { query } from '../config/db.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

export const myBookings = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await bookings.findByUser(req.user.sub, { page: Number(page)||1, limit: Number(limit)||20, status });
  res.json({ success: true, message: 'Bookings retrieved', data: result });
});

/* Admin: list all bookings with optional status filter */
export const allBookings = asyncHandler(async (req, res) => {
  const { status, page, limit, search } = req.query;
  const params = [], where = [];

  if (status)  { params.push(status); where.push(`rb.status = $${params.length}`); }
  if (search)  {
    params.push(`%${search.toLowerCase()}%`);
    where.push(`(LOWER(r.name) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(rb.purpose) LIKE $${params.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await query(
    `SELECT COUNT(*) FROM room_bookings rb
     JOIN rooms r ON r.id = rb.room_id
     JOIN users u ON u.id = rb.user_id
     ${whereClause}`, params);
  const total = Number(countRes.rows[0].count);
  const p = Number(page) || 1;
  const l = Math.min(Number(limit) || 20, 100);
  const offset = (p - 1) * l;
  params.push(l, offset);

  const { rows } = await query(
    `SELECT rb.id, rb.start_time, rb.end_time, rb.purpose, rb.status, rb.created_at,
            r.name AS room_name, r.room_code, r.building,
            u.name AS user_name, u.email AS user_email, u.role AS user_role
     FROM room_bookings rb
     JOIN rooms r ON r.id = rb.room_id
     JOIN users u ON u.id = rb.user_id
     ${whereClause}
     ORDER BY rb.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ success: true, message: 'All bookings retrieved', data: { rows, total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
});

export const create = asyncHandler(async (req, res) => {
  const { room_id, start_time, end_time, purpose } = req.body;
  if (!room_id || !start_time || !end_time) throw new AppError(400, 'room_id, start_time, end_time are required', 'VALIDATION');

  const start = new Date(start_time);
  const end   = new Date(end_time);
  if (isNaN(start) || isNaN(end)) throw new AppError(400, 'Invalid date format', 'VALIDATION');
  if (end <= start)               throw new AppError(400, 'end_time must be after start_time', 'VALIDATION');
  if (start < new Date())         throw new AppError(400, 'Cannot book in the past', 'VALIDATION');

  const room = await rooms.findById(room_id);
  if (!room || !room.is_active) throw new AppError(404, 'Room not found or inactive', 'NOT_FOUND');

  let booking;
  try {
    booking = await bookings.create({ roomId: room_id, userId: req.user.sub, startTime: start_time, endTime: end_time, purpose });
  } catch (e) {
    /* PostgreSQL EXCLUDE constraint violation = 23P01 */
    if (e.code === '23P01') throw new AppError(409, 'This room is already booked for that time slot', 'BOOKING_CONFLICT');
    throw e;
  }

  /* Fire-and-forget: socket emit + DB notification (non-fatal) */
  import('../sockets/notify.js').then(({ createNotificationAndEmit, emitBookingConfirmed }) => {
    emitBookingConfirmed({ userId: req.user.sub, bookingId: booking.id, roomName: room.name, startTime: start_time });
    return createNotificationAndEmit({
      userId: req.user.sub,
      title:  'Room booking confirmed',
      body:   `Your booking for ${room.name} has been confirmed.`,
      type:   'success',
    });
  }).catch(() => {/* non-fatal */});

  res.status(201).json({ success: true, message: 'Room booked successfully', data: { booking } });
});

export const cancel = asyncHandler(async (req, res) => {
  const booking = await bookings.cancel(req.params.id, req.user.sub);
  if (!booking) throw new AppError(404, 'Booking not found or cannot be cancelled', 'NOT_FOUND');
  res.json({ success: true, message: 'Booking cancelled', data: { booking } });
});

export const adminCancel = asyncHandler(async (req, res) => {
  const booking = await bookings.adminCancel(req.params.id);
  if (!booking) throw new AppError(404, 'Booking not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Booking cancelled by admin', data: { booking } });
});
