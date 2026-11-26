/**
 * Lost & Found service — API calls for lost_and_found_items.
 *
 * Endpoints:
 *   GET    /lost-found              — list items (optional filters)
 *   GET    /lost-found/:id          — get one item
 *   POST   /lost-found               — report a lost/found item
 *   PATCH  /lost-found/:id/status    — update item status
 *   DELETE /lost-found/:id           — delete item (admin only)
 */

import { api } from './apiClient.js';

export const getItems = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api(`/lost-found${q ? '?' + q : ''}`).then(r => r.data);
};

export const getItem = (id) => api(`/lost-found/${id}`).then(r => r.data.item);

export const createItem = (body) => api('/lost-found', { method: 'POST', body }).then(r => r.data.item);

export const updateItemStatus = (id, status) =>
  api(`/lost-found/${id}/status`, { method: 'PATCH', body: { status } }).then(r => r.data.item);

export const deleteItem = (id) => api(`/lost-found/${id}`, { method: 'DELETE' });
