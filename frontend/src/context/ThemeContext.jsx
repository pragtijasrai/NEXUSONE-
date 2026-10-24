import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { load, save } from '../utils/storage.js';
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => load('theme', 'light'));
  useEffect(() => { document.documentElement.dataset.theme = theme; save('theme', theme); }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
