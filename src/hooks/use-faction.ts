import { useState, useEffect } from 'react';

// indexedDB
import { getFaction } from '../data/indexed-db';

const useFaction = (factionId?: string) => {
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [data, setData] = useState<Wahapedia.Faction | undefined>(undefined);

  useEffect(() => {
    if (factionId && !hasStarted && !data && !loading) {
      setHasStarted(true);
      getFaction(factionId).then((faction) => {
        setLoading(false);
        setData(faction);
      });
    }
  }, [factionId, loading, hasStarted, setHasStarted, data, setData]);

  return {
    data,
    loading,
    refetch: () => {
      setHasStarted(false);
      setLoading(false);
      setData(undefined);
    }
  };
};

export default useFaction;
