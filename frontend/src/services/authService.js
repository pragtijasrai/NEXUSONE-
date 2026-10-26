/**
 * Auth service — dual-mode: mock (dev/demo) or real backend.
 *
 * Mode is controlled by VITE_USE_MOCK in .env:
 *   VITE_USE_MOCK=true  → uses localStorage mock (no backend needed)
 *   VITE_USE_MOCK=false → calls real backend API
 *
 * Pages and contexts never know which mode is active — they always call
 * the same functions. This is the abstraction boundary.
 *
 * Mock mode is kept fully functional so the UI can be demoed without
 * a running PostgreSQL instance. The role-chip quick-login on the
 * Login page uses mock mode regardless of VITE_USE_MOCK so it always
 * works for quick demos.
 */

import { mockUsers, DEMO_PASSWORD } from '../data/mockUsers.js';
import { load, save, remove } from '../utils/storage.js';
import { api, USE_MOCK, tokenStore } from './apiClient.js';

const SESSION_KEY = 'session';

/* ════════════════════════════════════════
   SHARED HELPERS
   ════════════════════════════════════════ */

export function getSession() {
  return load(SESSION_KEY, null);
}

/* ════════════════════════════════════════
   MOCK MODE (VITE_USE_MOCK=true)
   ════════════════════════════════════════ */

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

export function logout() {
  remove(SESSION_KEY);
  tokenStore.clearAll();
}

/* ════════════════════════════════════════
   REAL BACKEND MODE (VITE_USE_MOCK=false)
   ════════════════════════════════════════ */

/**
 * Sign in against the real backend.
 * On success: stores user in localStorage, tokens in session/localStorage.
 * Returns { ok: true, user } or { ok: false, error: string }.
 */
export async function loginRemote(email, password) {
  if (USE_MOCK) return login(email, password);
  try {
    const { data } = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    /* Store tokens */
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    /* Store user profile in localStorage for persistence */
    save(SESSION_KEY, data.user);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Sign out — revoke refresh token on backend, clear local state.
 */
export async function logoutRemote() {
  if (!USE_MOCK) {
    const refreshToken = tokenStore.getRefresh();
    try {
      await api('/auth/logout', { method: 'POST', body: { refreshToken }, skipAuth: true });
    } catch {
      /* Best-effort — clear local state regardless */
    }
  }
  remove(SESSION_KEY);
  tokenStore.clearAll();
}

/**
 * Fetch current user profile from backend (validates token is still good).
 */
export async function fetchMe() {
  if (USE_MOCK) return getSession();
  try {
    const { data } = await api('/auth/me');
    save(SESSION_KEY, data.user);
    return data.user;
  } catch {
    return null;
  }
}
