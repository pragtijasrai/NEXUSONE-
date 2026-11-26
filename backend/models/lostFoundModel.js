/**
 * Lost & Found model — all SQL queries for the lost_and_found_items table.
 *
 * Same pattern as ticketModel.js / announcementModel.js:
 *   - Parameterized queries only ($1, $2 …)
 *   - Returns plain JS objects
 *   - No business logic
 */

import { query } from '../config/db.js';

/* Map frontend category labels → DB category values */
const CATEGORY_MAP = {
  'Electronics': 'electronics',
  'Books & Notes': 'books',
  'ID & Cards': 'documents',
  'Bags': 'bags',
  'Keys': 'keys',
  'Clothing': 'clothing',
  'Accessories': 'accessories',
  'Other': 'other',
};

export const normalizeCategory = (cat) => CATEGORY_MAP[cat] ?? 'other';

export const findAll = async ({ type, status, category, search, page = 1, limit = 20 } = {}) => {
  const params = [], where = [];
  if (type)     { params.push(type);     where.push(`type = $${params.length}`); }
  if (status)   { params.push(status);   where.push(`status = $${params.length}`); }
  if (category) {
    const dbCat = normalizeCategory(category);
    params.push(dbCat);
    where.push(`category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where.push(`(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(location) LIKE $${params.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = Number((await query(`SELECT COUNT(*) FROM lost_and_found_items ${whereClause}`, params)).rows[0].count);
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT lf.*, u.name AS reporter_name
     FROM lost_and_found_items lf
     JOIN users u ON u.id = lf.reported_by
     ${whereClause}
     ORDER BY lf.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id) =>
  (await query(
    `SELECT lf.*, u.name AS reporter_name
     FROM lost_and_found_items lf
     JOIN users u ON u.id = lf.reported_by
     WHERE lf.id = $1`,
    [id],
  )).rows[0];

export const create = async ({ reported_by, title, description, location, category, type }) =>
  (await query(
    `INSERT INTO lost_and_found_items (title, description, location, category, type, status, reported_by)
     VALUES ($1, $2, $3, $4, $5, 'open', $6) RETURNING *`,
    [
      title,
      description ?? null,
      location ?? null,
      normalizeCategory(category),
      type ?? 'lost',
      reported_by,
    ],
  )).rows[0];

export const updateStatus = async (id, newStatus) =>
  (await query(
    `UPDATE lost_and_found_items
     SET status = $2, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, newStatus],
  )).rows[0];

export const remove = async (id) => query(`DELETE FROM lost_and_found_items WHERE id = $1`, [id]);
