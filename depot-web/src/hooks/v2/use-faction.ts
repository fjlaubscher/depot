import { useEffect } from 'react';
import { depot } from 'depot-core';
import { useAppContext } from '@/contexts/app/use-app-context';

interface UseFactionReturn {
  data: depot.Faction | undefined;
  loading: boolean;
  error: string | null;
}

const useFaction = (factionId?: string): UseFactionReturn => {
  const { state, loadFaction } = useAppContext();

  useEffect(() => {
    if (factionId && !state.factionCache[factionId]) {
      loadFaction(factionId);
    }
  }, [factionId, loadFaction, state.factionCache]);

  if (!factionId) {
    return {
      data: undefined,
      loading: false,
      error: null
    };
  }

  return {
    data: state.factionCache[factionId],
    loading: state.loading,
    error: state.error
  };
};

export default useFaction;
