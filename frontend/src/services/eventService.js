import { api } from './apiClient.js';

export const getEvents     = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/events${q ? '?'+q : ''}`).then(r => r.data);
};
export const getEvent      = (id) => api(`/events/${id}`).then(r => r.data.event);
export const registerEvent   = (id) => api(`/events/${id}/register`, { method:'POST' });
export const unregisterEvent = (id) => api(`/events/${id}/register`, { method:'DELETE' });

/* Admin / Faculty */
export const createEvent = (body) => api('/events', { method:'POST', body }).then(r => r.data.event);
export const updateEvent = (id, body) => api(`/events/${id}`, { method:'PATCH', body }).then(r => r.data.event);
export const deleteEvent = (id) => api(`/events/${id}`, { method:'DELETE' });
