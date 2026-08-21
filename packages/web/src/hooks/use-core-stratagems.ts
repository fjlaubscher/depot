import type { depot } from '@depot/core';
import { getDataPath, getDataUrl } from '@/utils/paths';
import useAsync from './use-async';

const CORE_STRATAGEM_FILE = 'core-stratagems.json';

const fetchCoreStratagems = async (): Promise<depot.Stratagem[]> => {
  const response = await fetch(getDataUrl(getDataPath(CORE_STRATAGEM_FILE)));
  if (!response.ok) {
    throw new Error('Failed to load core stratagems');
  }
  return (await response.json()) as depot.Stratagem[];
};

const useCoreStratagems = () => {
  const { data: stratagems, loading, error } = useAsync(fetchCoreStratagems, []);
  return { stratagems, loading, error };
};

export default useCoreStratagems;
