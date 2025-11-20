import { useEffect, useState } from 'react';
import type { depot } from '@depot/core';
import { useAppContext } from '@/contexts/app/use-app-context';

interface UseFactionReturn {
  data: depot.FactionManifest | undefined;
  loading: boolean;
  error: string | null;
}

const useFaction = (factionSlug?: string): UseFactionReturn => {
  const { getFactionManifest } = useAppContext();
  const shouldStartLoading = Boolean(factionSlug);
  const [data, setData] = useState<depot.FactionManifest | undefined>(undefined);
  const [loading, setLoading] = useState(shouldStartLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factionSlug) {
      setData(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    const loadFactionData = async () => {
      setLoading(true);
      setError(null);

      try {
        const manifest = await getFactionManifest(factionSlug);
        if (manifest) {
          setData(manifest);
        } else {
          setError(`Failed to load faction ${factionSlug}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadFactionData();
  }, [factionSlug, getFactionManifest]);

  return {
    data,
    loading,
    error
  };
};

export default useFaction;
