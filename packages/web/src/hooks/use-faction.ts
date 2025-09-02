import { useEffect, useState } from 'react';
import { depot } from '@depot/core';
import { useAppContext } from '@/contexts/app/use-app-context';

interface UseFactionReturn {
  data: depot.Faction | undefined;
  loading: boolean;
  error: string | null;
}

const useFaction = (factionId?: string): UseFactionReturn => {
  const { getFaction } = useAppContext();
  const [data, setData] = useState<depot.Faction | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factionId) {
      setData(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    const loadFactionData = async () => {
      setLoading(true);
      setError(null);

      try {
        const faction = await getFaction(factionId);
        if (faction) {
          setData(faction);
        } else {
          setError(`Failed to load faction ${factionId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadFactionData();
  }, [factionId, getFaction]);

  return {
    data,
    loading,
    error
  };
};

export default useFaction;
