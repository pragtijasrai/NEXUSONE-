/**
 * notify.js — creates a DB notification row and emits the socket event.
 * Import this in controllers that need to push real-time updates.
 *
 * Usage:
 *   await createNotificationAndEmit({
 *     userId: 5,
 *     title: 'Ticket updated',
 *     body:  'Your ticket #12 is now in progress.',
 *     type:  'info',
 *   });
 */

import { query } from '../config/db.js';
import { getIO } from './index.js';
import { logger } from '../utils/logger.js';

export async function createNotificationAndEmit({ userId, title, body, type = 'info' }) {
  /* 1. Persist to DB */
  let row;
  try {
    const res = await query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, body ?? null, type],
    );
    row = res.rows[0];
  } catch (err) {
    logger.error({ err }, 'Failed to persist notification');
    return;
  }

  /* 2. Emit to the connected socket(s) for that user */
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', {
      id:         row.id,
      title:      row.title,
      body:       row.body,
      type:       row.type,
      is_read:    false,
      created_at: row.created_at,
    });
  }

  return row;
}

export async function emitTicketUpdate({ userId, ticketId, status, note }) {
  const io = getIO();
  if (!io) return;
  io.to(`user:${userId}`).emit('ticket:updated', { ticketId, status, note });
}

export async function emitBookingConfirmed({ userId, bookingId, roomName, startTime }) {
  const io = getIO();
  if (!io) return;
  io.to(`user:${userId}`).emit('booking:confirmed', { bookingId, roomName, startTime });
}
