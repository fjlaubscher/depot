import { useCallback, useEffect, useState } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints } from '@/utils/collection';

export const useCollection = (collectionId?: string) => {
  const [collection, setCollection] = useState<depot.Collection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!collectionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await offlineStorage.getCollection(collectionId);
      setCollection(data);
    } catch (err) {
      console.error(`Failed to load collection ${collectionId}`, err);
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  const save = useCallback(async (updated: depot.Collection) => {
    const withPoints = {
      ...updated,
      points: { current: calculateCollectionPoints(updated) }
    };
    await offlineStorage.saveCollection(withPoints);
    setCollection(withPoints);
  }, []);

  const remove = useCallback(async () => {
    if (!collectionId) return;
    await offlineStorage.deleteCollection(collectionId);
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { collection, setCollection, loading, error, refresh: load, save, remove };
};

export default useCollection;
