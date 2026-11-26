import { api } from './apiClient.js';

export const getUsers  = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/users${q ? '?'+q : ''}`).then(r => r.data);
};
export const getUser   = (id) => api(`/users/${id}`).then(r => r.data.user);
export const updateUser = (id, body) => api(`/users/${id}`, { method:'PATCH', body }).then(r => r.data.user);
export const deleteUser = (id) => api(`/users/${id}`, { method:'DELETE' });
export const updateMyProfile  = (body) => api('/auth/me', { method:'PATCH', body }).then(r => r.data.user);
export const changeMyPassword = (body) => api('/auth/me/password', { method:'PATCH', body });
