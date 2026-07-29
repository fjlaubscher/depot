import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints } from '@depot/core/utils/collection';
import useAsync from './use-async';

export const useCollection = (collectionId?: string) => {
  const { data, setData, loading, error, refresh } = useAsync(
    async () => (collectionId ? offlineStorage.getCollection(collectionId) : null),
    [collectionId]
  );

  const save = useCallback(
    async (updated: depot.Collection) => {
      const withPoints = {
        ...updated,
        dataVersion: updated.dataVersion ?? null,
        points: { current: calculateCollectionPoints(updated) }
      };
      await offlineStorage.saveCollection(withPoints);
      setData(withPoints);
    },
    [setData]
  );

  const remove = useCallback(async () => {
    if (!collectionId) return;
    await offlineStorage.deleteCollection(collectionId);
  }, [collectionId]);

  return {
    collection: data ?? null,
    setCollection: setData,
    loading,
    error,
    refresh,
    save,
    remove
  };
};

export default useCollection;
