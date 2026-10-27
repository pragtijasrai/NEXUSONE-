/**
 * Auth service — dual-mode: mock (dev/demo) or real backend.
 *
 * VITE_USE_MOCK=true  → localStorage mock (no backend needed)
 * VITE_USE_MOCK=false → calls the real Express + PostgreSQL backend
 *
 * All auth operations enforce @chitkara.edu.in domain on the backend.
 * The frontend also validates the domain before sending the request.
 */

import { mockUsers, DEMO_PASSWORD } from '../data/mockUsers.js';
import { load, save, remove } from '../utils/storage.js';
import { api, USE_MOCK, tokenStore } from './apiClient.js';

const SESSION_KEY = 'session';

/* ── Shared ── */
export function getSession() {
  return load(SESSION_KEY, null);
}

/* ── Mock mode ── */
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

/* ── Real backend ── */

/** Register a new student or faculty account. */
export async function registerRemote(name, email, password, role) {
  if (USE_MOCK) {
    return { ok: false, error: 'Registration requires the real backend. Set VITE_USE_MOCK=false.' };
  }
  try {
    const { data } = await api('/auth/register', {
      method: 'POST',
      body: { name, email, password, role },
      skipAuth: true,
    });
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    save(SESSION_KEY, data.user);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Sign in with email + password. */
export async function loginRemote(email, password) {
  if (USE_MOCK) return login(email, password);
  try {
    const { data } = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    save(SESSION_KEY, data.user);
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Sign out — revoke refresh token on backend, clear local state. */
export async function logoutRemote() {
  if (!USE_MOCK) {
    const refreshToken = tokenStore.getRefresh();
    try {
      await api('/auth/logout', { method: 'POST', body: { refreshToken }, skipAuth: true });
    } catch {
      /* best-effort */
    }
  }
  remove(SESSION_KEY);
  tokenStore.clearAll();
}

/** Fetch current user from backend (validates token is still good). */
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
