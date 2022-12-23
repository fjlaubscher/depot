import { useCallback, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { IconButton, Stat, Tabs, useToast } from '@fjlaubscher/matter';

// components
import Layout from '../../components/layout';

// helpers
import { getFactionAlliance } from '../../utils/faction';

// hooks
import useFaction from '../../hooks/use-faction';
import useLocalStorage from '../../hooks/use-local-storage';

import FactionDatasheets from './datasheets';
import FactionPsychicPowers from './psychic-powers';
import FactionRelics from './relics';
import FactionStratagems from './stratagems';
import FactionWarlordTraits from './warlord-traits';

import styles from './faction.module.scss';

const Faction = () => {
  const { id } = useParams();
  const toast = useToast();
  const { data: faction, loading } = useFaction(id);

  const [myFactions, setMyFactions] = useLocalStorage<Option[]>('my-factions');
  const [activeTab, setActiveTab] = useState(0);

  const isMyFaction = useMemo(() => {
    if (myFactions) {
      return myFactions.filter((f) => f.id === id).length > 0;
    }

    return false;
  }, [id, myFactions]);

  const toggleMyFaction = useCallback(() => {
    if (myFactions && isMyFaction) {
      setMyFactions(myFactions.filter((f) => f.id !== id));
      toast({
        variant: 'success',
        text: `${faction?.name} removed from favourites.`
      });
    } else if (faction && !isMyFaction) {
      const myFaction: Option = { id: faction.id, name: faction.name };
      setMyFactions(myFactions ? [...myFactions, myFaction] : [myFaction]);
      toast({
        variant: 'success',
        text: `${faction.name} added to favourites.`
      });
    }
  }, [isMyFaction, faction, myFactions, setMyFactions, toast]);

  const alliance = faction ? getFactionAlliance(faction.id) : '';

  return (
    <Layout
      title="Faction"
      isLoading={loading}
      action={
        <IconButton
          className={isMyFaction ? styles.myFaction : undefined}
          onClick={toggleMyFaction}
        >
          <FiHeart />
        </IconButton>
      }
    >
      {faction && (
        <>
          <Stat title={alliance} value={faction.name} />
          <Tabs
            tabs={[
              'Datasheets',
              faction.psychicPowers.length ? 'Psychic Powers' : '',
              'Relics',
              'Stratagems',
              'Warlord Traits'
            ]}
            active={activeTab}
            onChange={setActiveTab}
          >
            <FactionDatasheets datasheets={faction.datasheets} />
            {faction.psychicPowers.length ? (
              <FactionPsychicPowers psychicPowers={faction.psychicPowers} />
            ) : undefined}
            <FactionRelics relics={faction.relics} />
            <FactionStratagems stratagems={faction.stratagems} />
            <FactionWarlordTraits warlordTraits={faction.warlordTraits} />
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default Faction;
