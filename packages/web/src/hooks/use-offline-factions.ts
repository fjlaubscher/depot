import { useFactionsContext } from '@/contexts/factions/use-factions-context';

export const useOfflineFactions = () => {
  const { state, clearOfflineData } = useFactionsContext();

  return {
    offlineFactions: state.offlineFactions,
    clearOfflineData
  };
};

export default useOfflineFactions;
