import { query } from '../config/db.js';

export const findAll = async ({ audience, category, page = 1, limit = 20 } = {}) => {
  const params = [], where = [];
  if (audience && audience !== 'all') {
    params.push(audience);
    where.push(`(audience = 'all' OR audience = $${params.length})`);
  }
  if (category) { params.push(category); where.push(`category = $${params.length}`); }
  where.push(`a.status = 'published'`);
  const whereClause = `WHERE ${where.join(' AND ')}`;

  const total = Number((await query(`SELECT COUNT(*) FROM announcements a ${whereClause}`, params)).rows[0].count);
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT a.*, u.name AS author_name FROM announcements a
     JOIN users u ON u.id = a.created_by
     ${whereClause} ORDER BY a.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id) =>
  (await query(
    `SELECT a.*, u.name AS author_name FROM announcements a
     JOIN users u ON u.id = a.created_by WHERE a.id = $1`, [id],
  )).rows[0];

export const create = async (fields) =>
  (await query(
    `INSERT INTO announcements (title, body, category, priority, audience, created_by, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [fields.title, fields.body, fields.category ?? 'general', fields.priority ?? 'normal',
     fields.audience ?? 'all', fields.created_by, fields.status ?? 'published'],
  )).rows[0];

export const update = async (id, fields) =>
  (await query(
    `UPDATE announcements SET
       title    = COALESCE($2, title),
       body     = COALESCE($3, body),
       category = COALESCE($4, category),
       priority = COALESCE($5, priority),
       audience = COALESCE($6, audience),
       status   = COALESCE($7, status)
     WHERE id = $1 RETURNING *`,
    [id, fields.title, fields.body, fields.category, fields.priority, fields.audience, fields.status],
  )).rows[0];

export const remove = async (id) => query(`DELETE FROM announcements WHERE id = $1`, [id]);
