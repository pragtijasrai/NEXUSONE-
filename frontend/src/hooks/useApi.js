/**
 * useApi — generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => roomService.list());
 *
 * Returns:
 *   data     — the resolved value (null until first successful fetch)
 *   loading  — true on first load
 *   error    — Error object if the last call failed, null otherwise
 *   refetch  — call to re-run the same fetch
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) { setData(result); setLoading(false); }
    } catch (e) {
      if (mountedRef.current) { setError(e); setLoading(false); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
