// Service abstraction: mock (localStorage) now, real API when VITE_USE_MOCK=false. Pages never know which.
import { mockUsers, DEMO_PASSWORD } from '../data/mockUsers.js';
import { load, save, remove } from '../utils/storage.js';
import { api, USE_MOCK } from './apiClient.js';
const SESSION_KEY = 'session';
export function getSession() { return load(SESSION_KEY, null); }
export function login(email, password) {
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || password !== DEMO_PASSWORD) return { ok: false, error: 'Email or demo password is incorrect.' };
  if (user.status !== 'active') return { ok: false, error: 'This demo account is deactivated.' };
  save(SESSION_KEY, user);
  return { ok: true, user };
}
export function loginAsRole(role) {
  const user = mockUsers.find((u) => u.role === role);
  if (!user) return { ok: false, error: 'No demo account for this role.' };
  save(SESSION_KEY, user);
  return { ok: true, user };
}
export function logout() { remove(SESSION_KEY); }
// Backend-ready call, used once the UI switches off mock mode.
export async function loginRemote(email, password) {
  if (USE_MOCK) return login(email, password);
  try { const { user, token } = await api('/auth/login', { method: 'POST', body: { email, password } }); save(SESSION_KEY, { ...user, token }); return { ok: true, user }; }
  catch (e) { return { ok: false, error: e.message }; }
}
