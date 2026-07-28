import type { depot } from '@depot/core';
import { useFactionsContext } from '@/contexts/factions/context';
import useAsync from './use-async';

interface UseDatasheetReturn {
  data: depot.Datasheet | undefined;
  loading: boolean;
  error: string | null;
}

const useDatasheet = (factionSlug?: string, datasheetIdOrSlug?: string): UseDatasheetReturn => {
  const { getDatasheet } = useFactionsContext();

  const { data, loading, error } = useAsync(async () => {
    if (!factionSlug || !datasheetIdOrSlug) return undefined;
    const datasheet = await getDatasheet(factionSlug, datasheetIdOrSlug);
    if (!datasheet) {
      throw new Error(`Failed to load datasheet ${datasheetIdOrSlug}`);
    }
    return datasheet;
  }, [datasheetIdOrSlug, factionSlug, getDatasheet]);

  return { data, loading, error };
};

export default useDatasheet;
