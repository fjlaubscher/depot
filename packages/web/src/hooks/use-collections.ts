import type { depot } from '@depot/core';

import { offlineStorage } from '@/data/offline-storage';
import useAsync from './use-async';

export const useCollections = (): {
  collections: depot.Collection[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} => {
  const { data, loading, error, refresh } = useAsync(() => offlineStorage.getCollections(), []);
  return { collections: data ?? [], loading, error, refresh };
};

export default useCollections;
