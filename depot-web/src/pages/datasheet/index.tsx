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
      return faction.datasheets.find((ds) => ds.id === id);
    }

    return undefined;
  }, [faction, id]);

  const datasheetCost = datasheet ? datasheet.modelCosts[0] : undefined;
  const alternateCost = datasheet ? datasheet.modelCosts[1] : undefined;

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
              description={datasheetCost?.description}
            />
            <Stat
              className={styles.cost}
              title="Points"
              value={datasheetCost?.cost || '-'}
              description={alternateCost?.cost}
            />
          </div>
          <Tabs tabs={['Datasheet', 'Stratagems']} onChange={setActiveTab} active={activeTab}>
            <DatasheetProfile datasheet={datasheet} />
            <DatasheetStratagems stratagems={datasheet.stratagems} />
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default Datasheet;
