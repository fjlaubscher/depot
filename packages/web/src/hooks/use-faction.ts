import type { depot } from '@depot/core';
import { useFactionsContext } from '@/contexts/factions/context';
import useAsync from './use-async';

interface UseFactionReturn {
  data: depot.FactionManifest | undefined;
  loading: boolean;
  error: string | null;
}

const useFaction = (factionSlug?: string): UseFactionReturn => {
  const { getFactionManifest } = useFactionsContext();

  const { data, loading, error } = useAsync(async () => {
    if (!factionSlug) return undefined;
    const manifest = await getFactionManifest(factionSlug);
    if (!manifest) {
      throw new Error(`Failed to load faction ${factionSlug}`);
    }
    return manifest;
  }, [factionSlug, getFactionManifest]);

  return { data, loading, error };
};

export default useFaction;
