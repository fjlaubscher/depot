import { useState, useEffect } from 'react';

// hooks
import useFetch from './use-fetch';

// indexedDB
import { createFaction, getFaction } from '../data/indexed-db';

const useFaction = (factionId?: string) => {
  const {
    data: fetchedData,
    loading: fetching,
    refetch
  } = useFetch<depot.Faction>(`/data/${factionId}.json`, true);
  const [hasChecked, setHasChecked] = useState(false);
  const [dataExists, setDataExists] = useState(false);
  const [data, setData] = useState<depot.Faction | undefined>(undefined);

  useEffect(() => {
    if (factionId && !hasChecked) {
      setHasChecked(true);

      getFaction(factionId)
        .then((faction) => {
          setDataExists(true);
          setData(faction);
        })
        .catch(() => setDataExists(false));
    } else if (factionId && hasChecked && !dataExists) {
      refetch();
    } else if (!fetching && hasChecked && fetchedData) {
      setData(fetchedData);
      createFaction(fetchedData);
    }
  }, [
    factionId,
    hasChecked,
    setHasChecked,
    dataExists,
    setDataExists,
    fetching,
    fetchedData,
    refetch
  ]);

  return {
    data,
    loading: fetching || !dataExists,
    refetch: () => {
      setHasChecked(false);
      setDataExists(false);
      setData(undefined);
    }
  };
};

export default useFaction;
