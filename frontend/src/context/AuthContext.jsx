/**
 * AuthContext — provides authentication state to the entire React app.
 *
 * Works in two modes controlled by VITE_USE_MOCK:
 *   Mock mode  (VITE_USE_MOCK=true):  uses localStorage mock users
 *   Real mode  (VITE_USE_MOCK=false): calls the real backend API
 *
 * The context exposes:
 *   user        — the logged-in user object, or null
 *   loading     — true while checking session on first load
 *   signIn      — email/password login (mock in mock mode)
 *   signInRemote — email/password login against real backend
 *   signInAs    — quick-login as a role (always mock — for demo chips)
 *   signOut     — logout (clears tokens + session)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as auth from '../services/authService.js';
import { USE_MOCK, tokenStore } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── On mount: restore session ── */
  useEffect(() => {
    const restore = async () => {
      const session = auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      if (!USE_MOCK && tokenStore.getAccess()) {
        /* Validate token is still good by fetching /auth/me */
        const fresh = await auth.fetchMe();
        setUser(fresh || null);
        if (!fresh) auth.logout(); // clear stale session
      } else {
        /* Mock mode or no token — trust localStorage session */
        setUser(session);
      }

      setLoading(false);
    };

    restore();
  }, []);

  /* ── Mock sign-in (email+password, uses mock data) ── */
  const signIn = useCallback((email, password) => {
    const r = auth.login(email, password);
    if (r.ok) setUser(r.user);
    return r;
  }, []);

  /* ── Real backend sign-in ── */
  const signInRemote = useCallback(async (email, password) => {
    const r = await auth.loginRemote(email, password);
    if (r.ok) setUser(r.user);
    return r;
  }, []);

  /* ── Quick-login as role chip (always mock — demo only) ── */
  const signInAs = useCallback((role) => {
    const r = auth.loginAsRole(role);
    if (r.ok) setUser(r.user);
    return r;
  }, []);

  /* ── Sign out ── */
  const signOut = useCallback(async () => {
    await auth.logoutRemote();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInRemote, signInAs, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
