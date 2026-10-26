import * as notifs from '../models/notificationModel.js';
import { asyncHandler } from '../utils/AppError.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, unread } = req.query;
  const result = await notifs.findByUser(req.user.sub, {
    page: Number(page)||1,
    limit: Math.min(Number(limit)||20, 50),
    unreadOnly: unread === 'true',
  });
  const count = await notifs.unreadCount(req.user.sub);
  res.json({ success: true, message: 'Notifications retrieved', data: { ...result, unreadCount: count } });
});

export const markRead = asyncHandler(async (req, res) => {
  await notifs.markRead(req.params.id, req.user.sub);
  res.json({ success: true, message: 'Marked as read', data: null });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notifs.markAllRead(req.user.sub);
  res.json({ success: true, message: 'All notifications marked as read', data: null });
});
