import { query } from '../config/db.js';

export const findAll = async ({ category, page = 1, limit = 20 } = {}) => {
  const params = [], where = [];
  if (category && category !== 'all') { params.push(category); where.push(`category = $${params.length}`); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = Number((await query(`SELECT COUNT(*) FROM events ${whereClause}`, params)).rows[0].count);
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT e.*,
       (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) AS registrations
     FROM events e ${whereClause}
     ORDER BY e.event_date ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id) =>
  (await query(
    `SELECT e.*, (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) AS registrations
     FROM events e WHERE e.id = $1`, [id],
  )).rows[0];

export const create = async (fields) =>
  (await query(
    `INSERT INTO events (title, description, event_date, location, category, organizer, capacity, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [fields.title, fields.description, fields.event_date, fields.location,
     fields.category ?? 'general', fields.organizer, fields.capacity ?? 100, fields.created_by],
  )).rows[0];

export const update = async (id, fields) =>
  (await query(
    `UPDATE events SET
       title       = COALESCE($2, title),
       description = COALESCE($3, description),
       event_date  = COALESCE($4, event_date),
       location    = COALESCE($5, location),
       category    = COALESCE($6, category),
       organizer   = COALESCE($7, organizer),
       capacity    = COALESCE($8, capacity)
     WHERE id = $1 RETURNING *`,
    [id, fields.title, fields.description, fields.event_date, fields.location,
     fields.category, fields.organizer, fields.capacity],
  )).rows[0];

export const remove = async (id) => query(`DELETE FROM events WHERE id = $1`, [id]);

export const register = async (eventId, userId) =>
  (await query(
    `INSERT INTO event_registrations (event_id, user_id) VALUES ($1,$2)
     ON CONFLICT (event_id, user_id) DO NOTHING RETURNING *`,
    [eventId, userId],
  )).rows[0];

export const unregister = async (eventId, userId) =>
  query(`DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2`, [eventId, userId]);

export const isRegistered = async (eventId, userId) =>
  !!(await query(`SELECT 1 FROM event_registrations WHERE event_id=$1 AND user_id=$2`, [eventId, userId])).rows[0];
