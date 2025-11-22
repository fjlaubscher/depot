import { useEffect, useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import { useAppContext } from '@/contexts/app/use-app-context';
import type { DatasheetListItem } from '@/types/datasheets';

const CONCURRENCY_LIMIT = 6;

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
  const { getDatasheet } = useAppContext();
  const [datasheets, setDatasheets] = useState<depot.Datasheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!factionSlug || targets.length === 0) {
      setDatasheets([]);
      setLoading(false);
      setError(null);
      setLoadedCount(0);
      return;
    }

    let isCancelled = false;

    const loadDatasheets = async () => {
      setLoading(true);
      setError(null);
      setLoadedCount(0);

      try {
        const results: depot.Datasheet[] = [];
        let cursor = 0;

        const runNext = async (): Promise<void> => {
          if (isCancelled || cursor >= targets.length) {
            return;
          }

          const target = targets[cursor++];
          const sheet = await getDatasheet(factionSlug, target.id);
          if (!sheet) {
            throw new Error(`Failed to load datasheet ${target.id}`);
          }
          results.push(sheet);
          setLoadedCount((count) => count + 1);
          await runNext();
        };

        const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, targets.length) }, () =>
          runNext()
        );

        await Promise.all(workers);

        if (!isCancelled) {
          setDatasheets(results);
        }
      } catch (err) {
        if (!isCancelled) {
          setDatasheets([]);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadDatasheets();

    return () => {
      isCancelled = true;
    };
  }, [factionSlug, getDatasheet, targets]);

  return {
    datasheets,
    loading,
    error,
    progress: {
      loaded: loadedCount,
      total: targets.length
    }
  };
};

export default useFactionDatasheets;
