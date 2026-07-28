import { offlineStorage } from '@/data/offline-storage';
import useAsync from './use-async';

export const useCollections = () => {
  const { data, loading, error, refresh } = useAsync(() => offlineStorage.getCollections(), []);
  return { collections: data ?? [], loading, error, refresh };
};

export default useCollections;
