import { api } from './apiClient.js';

export const getNotifications = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/notifications${q ? '?'+q : ''}`).then(r => r.data);
};
export const markRead    = (id) => api(`/notifications/${id}/read`, { method:'PATCH' });
export const markAllRead = ()   => api('/notifications/read-all', { method:'PATCH' });
