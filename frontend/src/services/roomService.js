import { api } from './apiClient.js';

export const getRooms      = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/rooms${q ? '?'+q : ''}`).then(r => r.data);
};
export const getRoom       = (id) => api(`/rooms/${id}`).then(r => r.data.room);
export const getMyBookings = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/bookings/me${q ? '?'+q : ''}`).then(r => r.data);
};
export const createBooking = (body) => api('/bookings', { method:'POST', body }).then(r => r.data.booking);
export const cancelBooking = (id)   => api(`/bookings/${id}/cancel`, { method:'PATCH' }).then(r => r.data.booking);

/* Admin only */
export const adminCreateRoom  = (body) => api('/rooms', { method:'POST', body }).then(r => r.data.room);
export const adminUpdateRoom  = (id, body) => api(`/rooms/${id}`, { method:'PATCH', body }).then(r => r.data.room);
export const adminDeleteRoom  = (id) => api(`/rooms/${id}`, { method:'DELETE' });
export const adminCancelBooking = (id) => api(`/bookings/${id}/admin-cancel`, { method:'PATCH' }).then(r => r.data.booking);
