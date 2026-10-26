import * as bookings from '../models/bookingModel.js';
import * as rooms from '../models/roomModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

export const myBookings = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await bookings.findByUser(req.user.sub, { page: Number(page)||1, limit: Number(limit)||20, status });
  res.json({ success: true, message: 'Bookings retrieved', data: result });
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
