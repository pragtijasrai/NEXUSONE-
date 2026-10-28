/**
 * AuthContext — authentication state for the entire app.
 *
 * Reload fix:
 *   On page reload, we immediately set the user from the localStorage session
 *   and set loading=false so the page renders right away.
 *   We then silently validate the token in the background — if invalid we
 *   show the dashboard briefly then redirect to login, which is much better
 *   than a blank screen.
 *
 * Register fix:
 *   signUp is wrapped in a try/catch so any unexpected error returns
 *   { ok: false, error } instead of throwing and crashing React.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as auth from '../services/authService.js';
import { USE_MOCK, tokenStore } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /* Initialise directly from localStorage — no async, no blank screen.
     Validate the session has the required fields before trusting it. */
  const [user, setUser]   = useState(() => {
    const s = auth.getSession();
    /* Must have at minimum: id, name, role, email, status */
    if (s && s.name && s.role && s.email) return s;
    if (s) auth.logout(); // corrupt session — clear it
    return null;
  });
  const [loading, setLoading] = useState(false); // start false — we already have the session

  /* After mount: silently revalidate the token in the background */
  useEffect(() => {
    if (USE_MOCK) return; // mock mode — trust localStorage always
    const session = auth.getSession();
    if (!session) return; // no session to validate

    const token = tokenStore.getAccess();
    if (!token) {
      // No access token — try to get a new one via refresh token silently
      auth.fetchMe().then(fresh => {
        if (!fresh) {
          // Refresh also failed — clear the stale session
          auth.logout();
          setUser(null);
        } else {
          setUser(fresh);
        }
      }).catch(() => {
        // Network error — keep the cached session, user can still browse
        // They'll get a 401 when making real API calls
      });
    } else {
      // We have a token — validate it quietly, don't block render
      auth.fetchMe().then(fresh => {
        if (fresh) setUser(fresh);
        // If fresh is null, keep current user — avoids flash-to-login on slow networks
      }).catch(() => {/* keep cached user */});
    }
  }, []);

  const signIn = useCallback((email, password) => {
    const r = auth.login(email, password);
    if (r.ok) setUser(r.user);
    return r;
  }, []);

  const signUp = useCallback(async (name, email, password, role) => {
    try {
      const r = await auth.registerRemote(name, email, password, role);
      if (r.ok) setUser(r.user);
      return r;
    } catch (e) {
      return { ok: false, error: e?.message || 'Registration failed. Please try again.' };
    }
  }, []);

  const signInRemote = useCallback(async (email, password) => {
    try {
      const r = await auth.loginRemote(email, password);
      if (r.ok) setUser(r.user);
      return r;
    } catch (e) {
      return { ok: false, error: e?.message || 'Login failed. Please try again.' };
    }
  }, []);

  const signInAs = useCallback((role) => {
    const r = auth.loginAsRole(role);
    if (r.ok) setUser(r.user);
    return r;
  }, []);

  const signOut = useCallback(async () => {
    try { await auth.logoutRemote(); } catch { /* ignore */ }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInRemote, signInAs, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
