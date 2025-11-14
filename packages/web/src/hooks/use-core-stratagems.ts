import { useEffect, useState } from 'react';
import type { depot } from '@depot/core';
import { getDataPath, getDataUrl } from '@/utils/paths';

interface UseCoreStratagemsResult {
  stratagems?: depot.Stratagem[];
  loading: boolean;
  error: string | null;
}

const CORE_STRATAGEM_FILE = 'core-stratagems.json';

const useCoreStratagems = (): UseCoreStratagemsResult => {
  const [stratagems, setStratagems] = useState<depot.Stratagem[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supportsAbortController = typeof AbortController !== 'undefined';
    const controller = supportsAbortController ? new AbortController() : null;

    const fetchCoreStratagems = async () => {
      try {
        setLoading(true);
        setError(null);

        const requestInit: RequestInit | undefined = controller
          ? { signal: controller.signal }
          : undefined;
        const response = await fetch(
          getDataUrl(getDataPath(CORE_STRATAGEM_FILE)),
          requestInit
        );

        if (!response.ok) {
          throw new Error('Failed to load core stratagems');
        }

        const data = (await response.json()) as depot.Stratagem[];
        setStratagems(data);
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Unknown error while loading core stratagems';
        setError(message);
        console.error(message, err);
      } finally {
        if (!controller || !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchCoreStratagems();

    return () => controller?.abort();
  }, []);

  return { stratagems, loading, error };
};

export default useCoreStratagems;
