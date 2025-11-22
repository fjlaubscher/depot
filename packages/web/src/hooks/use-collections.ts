import { useEffect, useState, useCallback } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';

export const useCollections = () => {
  const [collections, setCollections] = useState<depot.Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offlineStorage.getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections', err);
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { collections, loading, error, refresh: load };
};

export default useCollections;
