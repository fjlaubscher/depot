import { useFactionsContext } from '@/contexts/factions/use-factions-context';

export const useFactionIndex = () => {
  const { state, checkForDataUpdates } = useFactionsContext();

  return {
    factionIndex: state.factionIndex,
    loading: state.loading,
    error: state.error,
    dataVersion: state.dataVersion,
    checkForDataUpdates
  };
};

export default useFactionIndex;
