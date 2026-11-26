/**
 * Admin service — API calls for admin-only endpoints.
 */
import { api } from './apiClient.js';

/* Users */
export const getUsers   = (p = {}) => { const q = new URLSearchParams(p).toString(); return api(`/users${q?'?'+q:''}`).then(r => r.data); };
export const getUser    = (id) => api(`/users/${id}`).then(r => r.data.user);
export const updateUser = (id, body) => api(`/users/${id}`, { method:'PATCH', body }).then(r => r.data.user);
export const deleteUser = (id) => api(`/users/${id}`, { method:'DELETE' });

/* Rooms */
export const getRooms      = (p = {}) => { const q = new URLSearchParams(p).toString(); return api(`/rooms${q?'?'+q:''}`).then(r => r.data); };
export const createRoom    = (body) => api('/rooms', { method:'POST', body }).then(r => r.data.room);
export const updateRoom    = (id, body) => api(`/rooms/${id}`, { method:'PATCH', body }).then(r => r.data.room);
export const deleteRoom    = (id) => api(`/rooms/${id}`, { method:'DELETE' });

/* Bookings (admin: all bookings) */
export const getAllBookings  = (p = {}) => { const q = new URLSearchParams(p).toString(); return api(`/bookings${q?'?'+q:''}`).then(r => r.data); };
export const cancelBooking   = (id) => api(`/bookings/${id}/admin-cancel`, { method:'PATCH' }).then(r => r.data.booking);

/* Courses (admin read) */
export const getCourses     = () => api('/admin/courses').then(r => r.data);

/* Sessions (admin read) */
export const getSessions    = () => api('/admin/sessions').then(r => r.data);

/* Attendance overview */
export const getAttendanceOverview = () => api('/admin/attendance').then(r => r.data);

/* Dashboard */
export const getDashboard   = () => api('/dashboard/admin').then(r => r.data);

/* Maintenance tickets (admin can see all) */
export const getAllTickets   = (p = {}) => { const q = new URLSearchParams(p).toString(); return api(`/maintenance${q?'?'+q:''}`).then(r => r.data); };
export const assignTicket   = (id, staff_id) => api(`/maintenance/${id}/assign`, { method:'PATCH', body:{ staff_id } }).then(r => r.data.ticket);
export const updateTicketStatus = (id, status, note) => api(`/maintenance/${id}/status`, { method:'PATCH', body:{ status, note } }).then(r => r.data.ticket);
