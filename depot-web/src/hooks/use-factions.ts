import { useState, useEffect } from 'react';

// indexedDB
import { getFactions } from '../data/indexed-db';

const useFactions = () => {
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [data, setData] = useState<Option[] | undefined>(undefined);

  useEffect(() => {
    if (!hasStarted && !data && !loading) {
      setHasStarted(true);
      getFactions().then((factions) => {
        setLoading(false);
        setData(factions);
      });
    }
  }, [loading, hasStarted, setHasStarted, data, setData]);

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

export default useFactions;
