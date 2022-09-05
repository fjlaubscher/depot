import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

// components
import Layout from '../../components/layout';
import WahapediaLink from '../../components/wahapedia-link';
import Tabs from '../../components/tabs';

// hooks
import useFaction from '../../hooks/use-faction';

import FactionDatasheets from './datasheets';
import FactionPsychicPowers from './psychic-powers';
import FactionRelics from './relics';
import FactionStratagems from './stratagems';
import FactionWarlordTraits from './warlord-traits';

const TABS = ['Datasheets', 'Psychic Powers', 'Relics', 'Stratagems', 'Warlord Traits'];

const Faction = () => {
  const { id } = useParams();
  const { data: faction, loading } = useFaction(id);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout
      title={faction?.name || 'Loading'}
      isLoading={loading}
      action={<WahapediaLink href={faction?.link} />}
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
