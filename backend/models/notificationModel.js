import { query } from '../config/db.js';

export const findByUser = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const params = [userId];
  let where = `WHERE user_id = $1`;
  if (unreadOnly) where += ` AND is_read = false`;

  const total = Number((await query(`SELECT COUNT(*) FROM notifications ${where}`, params)).rows[0].count);
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT * FROM notifications ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const markRead = async (id, userId) =>
  query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [id, userId]);

export const markAllRead = async (userId) =>
  query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);

export const create = async ({ userId, title, body, type = 'info' }) =>
  (await query(
    `INSERT INTO notifications (user_id, title, body, type) VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, title, body, type],
  )).rows[0];

export const unreadCount = async (userId) =>
  Number((await query(`SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false`, [userId])).rows[0].count);
