import React, { useCallback, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

// components
import IconButton from '../../components/icon-button';
import Layout from '../../components/layout';
import Tabs from '../../components/tabs';

// hooks
import useFaction from '../../hooks/use-faction';
import useLocalStorage from '../../hooks/use-local-storage';

import FactionDatasheets from './datasheets';
import FactionPsychicPowers from './psychic-powers';
import FactionRelics from './relics';
import FactionStratagems from './stratagems';
import FactionWarlordTraits from './warlord-traits';

import styles from './faction.module.scss';

const TABS = ['Datasheets', 'Psychic Powers', 'Relics', 'Stratagems', 'Warlord Traits'];

const Faction = () => {
  const { id } = useParams();
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
    } else if (faction && !isMyFaction) {
      const myFaction: Option = { id: faction.id, name: faction.name };
      setMyFactions(myFactions ? [...myFactions, myFaction] : [myFaction]);
    }
  }, [isMyFaction, faction, myFactions, setMyFactions]);

  return (
    <Layout
      title={faction?.name || 'Loading'}
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
      <Tabs tabs={TABS} onChange={setActiveTab} />
      {faction && activeTab === 0 && <FactionDatasheets datasheets={faction.datasheets} />}
      {faction && activeTab === 1 && <FactionPsychicPowers psychicPowers={faction.psychicPowers} />}
      {faction && activeTab === 2 && <FactionRelics relics={faction.relics} />}
      {faction && activeTab === 3 && <FactionStratagems stratagems={faction.stratagems} />}
      {faction && activeTab === 4 && <FactionWarlordTraits warlordTraits={faction.warlordTraits} />}
    </Layout>
  );
};

export default Faction;
