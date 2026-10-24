import { useState, useCallback } from 'react';
import { load, save } from '../utils/storage.js';
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => load(key, initial));
  const update = useCallback((next) => setValue((prev) => { const v = typeof next === 'function' ? next(prev) : next; save(key, v); return v; }), [key]);
  return [value, update];
}
