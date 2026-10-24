import { createContext, useContext, useState, useCallback } from 'react';
import * as auth from '../services/authService.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getSession());
  const signIn = useCallback((email, password) => { const r = auth.login(email, password); if (r.ok) setUser(r.user); return r; }, []);
  const signInAs = useCallback((role) => { const r = auth.loginAsRole(role); if (r.ok) setUser(r.user); return r; }, []);
  const signOut = useCallback(() => { auth.logout(); setUser(null); }, []);
  return <AuthContext.Provider value={{ user, signIn, signInAs, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
