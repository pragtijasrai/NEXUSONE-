/**
 * API client — thin fetch wrapper for the NexusOne backend.
 *
 * Features:
 *   - Automatically attaches the access token from storage on every request
 *   - Handles 401 → attempts one silent token refresh, then retries
 *   - Consistent error shape: throws Error with a human-readable message
 *   - USE_MOCK flag: when true, callers can skip real API calls entirely
 *
 * Token storage:
 *   - Access token: sessionStorage (cleared on tab close, not persisted)
 *   - Refresh token: localStorage (persisted across sessions)
 *
 * Why sessionStorage for access tokens?
 *   Storing JWTs in localStorage is a common XSS risk. sessionStorage is
 *   slightly better — it doesn't persist across tabs by default and is
 *   cleared when the browser session ends. For a university project this
 *   is an acceptable trade-off. Production apps should use httpOnly cookies.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/* ── Token storage keys ── */
const ACCESS_KEY  = 'nexusone:access_token';
const REFRESH_KEY = 'nexusone:refresh_token';

export const tokenStore = {
  getAccess:      ()    => sessionStorage.getItem(ACCESS_KEY),
  setAccess:      (t)   => sessionStorage.setItem(ACCESS_KEY, t),
  getRefresh:     ()    => localStorage.getItem(REFRESH_KEY),
  setRefresh:     (t)   => localStorage.setItem(REFRESH_KEY, t),
  clearAll:       ()    => {
    sessionStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/* ── Internal fetch with auth header ── */
async function fetchWithAuth(path, options = {}, accessToken) {
  const token = accessToken || tokenStore.getAccess();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
}

/* ── Silent token refresh ── */
async function silentRefresh() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Main API function — used throughout the app.
 *
 * Usage:
 *   const data = await api('/auth/me');
 *   const data = await api('/auth/login', { method: 'POST', body: { email, password } });
 *
 * Throws an Error on non-2xx responses with a human-readable message.
 */
export async function api(path, { method = 'GET', body, skipAuth = false } = {}) {
  const options = {
    method,
    body: body ? JSON.stringify(body) : undefined,
  };

  let res = await fetchWithAuth(path, options, skipAuth ? null : undefined);

  /* ── Auto-refresh on 401 ── */
  if (res.status === 401 && !skipAuth) {
    const newToken = await silentRefresh();
    if (newToken) {
      /* Retry with fresh token */
      res = await fetchWithAuth(path, options, newToken);
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
