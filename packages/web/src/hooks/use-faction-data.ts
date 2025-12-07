import { useFactionsContext } from '@/contexts/factions/use-factions-context';

export const useFactionData = () => {
  const { getFactionManifest, getDatasheet } = useFactionsContext();
  return { getFactionManifest, getDatasheet };
};

export default useFactionData;
