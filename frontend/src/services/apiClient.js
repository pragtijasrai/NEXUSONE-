// Thin fetch wrapper for the NexusOne backend. Base URL comes from VITE_API_BASE_URL (no secrets here).
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);
  return data;
}
