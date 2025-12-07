import { useEffect, useState } from 'react';
import type { depot } from '@depot/core';
import useFactionData from './use-faction-data';

interface UseDatasheetReturn {
  data: depot.Datasheet | undefined;
  loading: boolean;
  error: string | null;
}

const useDatasheet = (factionSlug?: string, datasheetIdOrSlug?: string): UseDatasheetReturn => {
  const { getDatasheet } = useFactionData();
  const shouldStartLoading = Boolean(factionSlug && datasheetIdOrSlug);
  const [data, setData] = useState<depot.Datasheet | undefined>(undefined);
  const [loading, setLoading] = useState(shouldStartLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factionSlug || !datasheetIdOrSlug) {
      setData(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const loadDatasheet = async () => {
      setLoading(true);
      setError(null);

      try {
        const datasheet = await getDatasheet(factionSlug, datasheetIdOrSlug);
        if (!datasheet) {
          throw new Error(`Failed to load datasheet ${datasheetIdOrSlug}`);
        }

        if (!isCancelled) {
          setData(datasheet);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(undefined);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadDatasheet();

    return () => {
      isCancelled = true;
    };
  }, [datasheetIdOrSlug, factionSlug, getDatasheet]);

  return {
    data,
    loading,
    error
  };
};

export default useDatasheet;
