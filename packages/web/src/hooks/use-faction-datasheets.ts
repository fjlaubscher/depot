import { useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import { useFactionsContext } from '@/contexts/factions/context';
import type { DatasheetListItem } from '@depot/core/utils/datasheets';
import useAsync from './use-async';

interface UseFactionDatasheetsResult {
  datasheets: depot.Datasheet[];
  loading: boolean;
  error: string | null;
  progress: {
    loaded: number;
    total: number;
  };
}

const useFactionDatasheets = (
  factionSlug?: string,
  datasheetRefs?: DatasheetListItem[]
): UseFactionDatasheetsResult => {
  const { getDatasheet } = useFactionsContext();
  const [loadedCount, setLoadedCount] = useState(0);

  const targets = useMemo(() => {
    if (!datasheetRefs || datasheetRefs.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    return datasheetRefs.filter((sheet) => {
      if (seen.has(sheet.id)) {
        return false;
      }
      seen.add(sheet.id);
      return true;
    });
  }, [datasheetRefs]);

  // ponytail: unbounded fan-out; datasheets are cached in IndexedDB after first
  // load, so reintroduce a pool only if cold loads measurably choke the network.
  const { data, loading, error } = useAsync(async () => {
    setLoadedCount(0);
    if (!factionSlug || targets.length === 0) {
      return [];
    }

    return Promise.all(
      targets.map(async (target) => {
        const sheet = await getDatasheet(factionSlug, target.id);
        if (!sheet) {
          throw new Error(`Failed to load datasheet ${target.id}`);
        }
        setLoadedCount((count) => count + 1);
        return sheet;
      })
    );
  }, [factionSlug, getDatasheet, targets]);

  return {
    datasheets: error ? [] : (data ?? []),
    loading,
    error,
    progress: {
      loaded: loadedCount,
      total: targets.length
    }
  };
};

export default useFactionDatasheets;
