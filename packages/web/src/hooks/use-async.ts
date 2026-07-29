import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function on mount and whenever deps change, tracking
 * data/loading/error state. Stale runs (superseded by a newer call) are ignored.
 */
export const useAsync = <T>(fn: () => Promise<T>, deps: unknown[]) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++runId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (id === runId.current) setData(result);
    } catch (err) {
      if (id === runId.current) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (id === runId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
};

export default useAsync;
