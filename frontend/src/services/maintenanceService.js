import { api } from './apiClient.js';

export const getTickets    = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/maintenance${q ? '?'+q : ''}`).then(r => r.data);
};
export const getTicket     = (id) => api(`/maintenance/${id}`).then(r => r.data);
export const createTicket  = (body) => api('/maintenance', { method:'POST', body }).then(r => r.data.ticket);
export const updateStatus  = (id, status, note) =>
  api(`/maintenance/${id}/status`, { method:'PATCH', body:{ status, note } }).then(r => r.data.ticket);
export const assignTicket  = (id, staff_id) =>
  api(`/maintenance/${id}/assign`, { method:'PATCH', body:{ staff_id } }).then(r => r.data.ticket);
