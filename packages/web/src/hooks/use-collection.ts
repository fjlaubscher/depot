import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints } from '@depot/core/utils/collection';
import useAsync from './use-async';

export const useCollection = (collectionId?: string) => {
  const { data, setData, loading, error } = useAsync(
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

  return { collection: data ?? null, loading, error, save };
};

export default useCollection;
