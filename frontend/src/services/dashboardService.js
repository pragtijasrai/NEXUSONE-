import { api } from './apiClient.js';

export const getStudentDashboard     = () => api('/dashboard/student').then(r => r.data);
export const getFacultyDashboard     = () => api('/dashboard/faculty').then(r => r.data);
export const getAdminDashboard       = () => api('/dashboard/admin').then(r => r.data);
export const getMaintenanceDashboard = () => api('/dashboard/maintenance').then(r => r.data);
