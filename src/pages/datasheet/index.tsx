import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

// components
import Layout from '../../components/layout';
import Tabs from '../../components/tabs';
import WahapediaLink from '../../components/wahapedia-link';

// hooks
import useFaction from '../../hooks/use-faction';

import DatasheetProfile from './profile';
import DatasheetWargear from './wargear';
import DatasheetAbilities from './abilities';

const TABS = ['Datasheet', 'Wargear', 'Abilities'];

const Datasheet = () => {
  const { factionId, id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const { data: faction, loading } = useFaction(factionId);
  const datasheet = useMemo(() => {
    if (faction && id) {
      return faction.datasheets.filter((ds) => ds.id === id)[0];
    }
  }, [faction, id]);

  console.log(datasheet);

  return (
    <Layout
      backLink={`/faction/${factionId}`}
      title={datasheet?.name || 'Loading'}
      isLoading={loading}
      action={<WahapediaLink href={datasheet?.link} />}
    >
      <Tabs tabs={TABS} onChange={setActiveTab} />
      {datasheet && activeTab === 0 && (
        <DatasheetProfile
          composition={datasheet.unit_composition}
          keywords={datasheet.keywords}
          power={datasheet.power_points}
          profiles={datasheet.datasheet}
          role={datasheet.role}
        />
      )}
      {datasheet && activeTab === 1 && <DatasheetWargear wargear={datasheet.wargear} />}
      {datasheet && activeTab === 2 && <DatasheetAbilities abilities={datasheet.abilities} />}
    </Layout>
  );
};

export default Datasheet;
