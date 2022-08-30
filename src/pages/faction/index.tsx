import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

// components
import Layout from '../../components/layout';
import WahapediaLink from '../../components/wahapedia-link';
import Tabs from '../../components/tabs';

// hooks
import useFaction from '../../hooks/use-faction';

import FactionDatasheets from './datasheets';
import FactionStratagems from './stratagems';

const TABS = ['Datasheets', 'Stratagems'];

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
      {faction && activeTab === 1 && <FactionStratagems stratagems={faction.stratagems} />}
    </Layout>
  );
};

export default Faction;
