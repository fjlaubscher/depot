import { useEffect } from 'react';
import { useAsync, useAsyncFn } from 'react-use';

// indexedDB
import { createFaction, getFaction } from '../data/indexed-db';

const useFaction = (factionId?: string) => {
  const { value: offlineData, loading: reading } = useAsync(
    () => getFaction(factionId),
    [factionId]
  );
  const [{ value: fetchedData, loading: fetching }, fetchFaction] = useAsyncFn(async () => {
    const response = await fetch(`/data/${factionId}.json`);
    const data = await response.json();

    if (data) {
      await createFaction(data);
    }

    return data as depot.Faction | undefined;
  }, [factionId]);

  useEffect(() => {
    if (!reading && !offlineData && !fetching && !fetchedData) {
      fetchFaction();
    }
  }, [reading, offlineData, fetching, fetchedData]);

  return {
    data: offlineData || fetchedData,
    loading: reading || fetching
  };
};

export default useFaction;
