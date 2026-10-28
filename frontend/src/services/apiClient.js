/**
 * API client — thin fetch wrapper for the NexusOne backend.
 *
 * Key fix: access token is now stored in localStorage (not sessionStorage)
 * so it survives page reloads. This eliminates the blank-screen-on-reload bug
 * where sessionStorage was cleared and fetchMe() had no token to use.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const ACCESS_KEY  = 'nexusone:access_token';
const REFRESH_KEY = 'nexusone:refresh_token';

export const tokenStore = {
  getAccess:  ()  => localStorage.getItem(ACCESS_KEY),
  setAccess:  (t) => localStorage.setItem(ACCESS_KEY, t),
  getRefresh: ()  => localStorage.getItem(REFRESH_KEY),
  setRefresh: (t) => localStorage.setItem(REFRESH_KEY, t),
  clearAll:   ()  => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function fetchWithAuth(path, options = {}, accessToken) {
  const token = accessToken ?? tokenStore.getAccess();
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

export async function api(path, { method = 'GET', body, skipAuth = false } = {}) {
  const options = {
    method,
    body: body ? JSON.stringify(body) : undefined,
  };

  let res = await fetchWithAuth(path, options, skipAuth ? null : undefined);

  if (res.status === 401 && !skipAuth) {
    const newToken = await silentRefresh();
    if (newToken) {
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
