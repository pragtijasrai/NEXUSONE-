import { query } from '../config/db.js';

const ALLOWED_SORT = new Set(['name', 'building', 'capacity', 'type', 'created_at']);

export async function findAll({ type, building, search, page = 1, limit = 20, sortBy = 'name', sortDir = 'ASC' } = {}) {
  const params = [], where = [];
  const safeSort = ALLOWED_SORT.has(sortBy) ? sortBy : 'name';
  const safeDir  = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  where.push(`is_active = true`);
  if (type)     { params.push(type);                      where.push(`type = $${params.length}`); }
  if (building) { params.push(`%${building.toLowerCase()}%`); where.push(`LOWER(building) LIKE $${params.length}`); }
  if (search)   { params.push(`%${search.toLowerCase()}%`);   where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(room_code) LIKE $${params.length})`); }

  const whereClause = `WHERE ${where.join(' AND ')}`;
  const countRes = await query(`SELECT COUNT(*) FROM rooms ${whereClause}`, params);
  const total    = Number(countRes.rows[0].count);

  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT id, room_code, name, building, capacity, type, amenities, is_active, created_at
     FROM rooms ${whereClause}
     ORDER BY ${safeSort} ${safeDir}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export const findById = async (id) =>
  (await query(`SELECT id, room_code, name, building, capacity, type, amenities, is_active, created_at FROM rooms WHERE id = $1`, [id])).rows[0];

export const create = async (fields) =>
  (await query(
    `INSERT INTO rooms (room_code, name, building, capacity, type, amenities)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [fields.room_code, fields.name, fields.building, fields.capacity, fields.type, fields.amenities ?? []],
  )).rows[0];

export const update = async (id, fields) =>
  (await query(
    `UPDATE rooms SET
       name      = COALESCE($2, name),
       building  = COALESCE($3, building),
       capacity  = COALESCE($4, capacity),
       type      = COALESCE($5, type),
       amenities = COALESCE($6, amenities),
       is_active = COALESCE($7, is_active)
     WHERE id = $1 RETURNING *`,
    [id, fields.name, fields.building, fields.capacity, fields.type, fields.amenities, fields.is_active],
  )).rows[0];

export const remove = async (id) => query(`DELETE FROM rooms WHERE id = $1`, [id]);

/** Check availability for a room in a time window — returns conflicting bookings */
export const checkAvailability = async (roomId, startTime, endTime, excludeBookingId = null) => {
  const params = [roomId, startTime, endTime];
  let sql = `SELECT id FROM room_bookings
             WHERE room_id = $1
               AND status IN ('pending','confirmed')
               AND tstzrange(start_time, end_time) && tstzrange($2::timestamptz, $3::timestamptz)`;
  if (excludeBookingId) { params.push(excludeBookingId); sql += ` AND id != $${params.length}`; }
  return (await query(sql, params)).rows;
};
