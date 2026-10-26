import { query, withTransaction } from '../config/db.js';

export const findById = async (id) =>
  (await query(
    `SELECT rb.*, r.name AS room_name, r.room_code, r.building, r.capacity, r.type
     FROM room_bookings rb JOIN rooms r ON r.id = rb.room_id
     WHERE rb.id = $1`, [id],
  )).rows[0];

export const findByUser = async (userId, { page = 1, limit = 20, status } = {}) => {
  const params = [userId];
  let where = `WHERE rb.user_id = $1`;
  if (status) { params.push(status); where += ` AND rb.status = $${params.length}`; }

  const countRes = await query(`SELECT COUNT(*) FROM room_bookings rb ${where}`, params);
  const total    = Number(countRes.rows[0].count);
  const offset   = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT rb.*, r.name AS room_name, r.room_code, r.building
     FROM room_bookings rb JOIN rooms r ON r.id = rb.room_id
     ${where} ORDER BY rb.start_time DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/** Create booking inside a transaction — DB EXCLUDE constraint catches overlaps */
export const create = async ({ roomId, userId, startTime, endTime, purpose }) =>
  withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO room_bookings (room_id, user_id, start_time, end_time, purpose)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [roomId, userId, startTime, endTime, purpose],
    );
    return rows[0];
  });

export const cancel = async (id, userId) =>
  (await query(
    `UPDATE room_bookings SET status = 'cancelled'
     WHERE id = $1 AND user_id = $2 AND status IN ('pending','confirmed')
     RETURNING *`,
    [id, userId],
  )).rows[0];

export const adminCancel = async (id) =>
  (await query(
    `UPDATE room_bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [id],
  )).rows[0];
