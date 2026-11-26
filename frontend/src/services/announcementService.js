import { api } from './apiClient.js';

export const getAnnouncements = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/announcements${q ? '?'+q : ''}`).then(r => r.data);
};
export const getAnnouncement  = (id) => api(`/announcements/${id}`).then(r => r.data.announcement);
export const createAnnouncement = (body) => api('/announcements', { method:'POST', body }).then(r => r.data.announcement);
export const updateAnnouncement = (id, body) => api(`/announcements/${id}`, { method:'PATCH', body }).then(r => r.data.announcement);
export const deleteAnnouncement = (id) => api(`/announcements/${id}`, { method:'DELETE' });
