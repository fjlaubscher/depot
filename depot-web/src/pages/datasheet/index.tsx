import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Stat, Tabs } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

// components
import BackButton from '../../components/button/back';
import Layout from '../../components/layout';
import ShareButton from '../../components/button/share';

// hooks
import useFaction from '../../hooks/use-faction';

// helpers
import { parseDamageAndModels } from '../../utils/datasheet';

import DatasheetProfile from './profile';
import DatasheetStratagems from './stratagems';

import styles from './datasheet.module.scss';

const Datasheet = () => {
  const { factionId, id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const { data: faction, loading } = useFaction(factionId);

  const datasheet = useMemo(() => {
    if (faction && id) {
      const ds = faction.datasheets.filter((ds) => ds.id === id)[0];
      const hasDamageProfiles = ds.damage.length > 0;
      const hasSingleModel = ds.costPerUnit === 'false' && ds.models.length === 1;

      return {
        ...ds,
        cost: hasSingleModel ? ds.models[0].cost : ds.cost,
        models: hasDamageProfiles ? parseDamageAndModels(ds) : ds.models
      } as depot.Datasheet;
    }

    return undefined;
  }, [faction, id]);

  console.log(datasheet);

  return (
    <Layout
      title="Datasheet"
      isLoading={loading}
      action={<ShareButton title={datasheet?.name || 'Loading'} />}
    >
      <BackButton to={`/faction/${factionId}`}>{faction?.name}</BackButton>
      {datasheet && (
        <>
          <div className={styles.header}>
            <Stat
              title={datasheet.role}
              value={datasheet.name}
              description={datasheet?.models[0].baseSize}
            />
            <Stat
              className={styles.cost}
              title="Cost"
              value={`${datasheet.powerPoints} PR`}
              description={datasheet.cost ? `${datasheet.cost} points` : undefined}
            />
          </div>
          <Tabs tabs={['Datasheet', 'Stratagems']} onChange={setActiveTab} active={activeTab}>
            <DatasheetProfile datasheet={datasheet} showCost={!datasheet.cost} />
            <DatasheetStratagems stratagems={datasheet.stratagems} />
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default Datasheet;
