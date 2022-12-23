import React, { useMemo, useState } from 'react';
import { Alert, Grid, Tabs } from '@fjlaubscher/matter';

// components
import Filters from '../../components/filters';
import Layout from '../../components/layout';
import LinkCard from '../../components/card/link';
import Search from '../../components/search';

// helpers
import { getFactionAlliance } from '../../utils/faction';

// hooks
import useFactions from '../../hooks/use-factions';
import useDebounce from '../../hooks/use-debounce';
import useLocalStorage from '../../hooks/use-local-storage';

import styles from './home.module.scss';

interface GroupedFactions {
  [key: string]: Option[];
}

const Home = () => {
  const { data: factions, loading: loadingFactions } = useFactions();

  const [myFactions] = useLocalStorage<Option[]>('my-factions');
  const hasMyFactions = myFactions ? myFactions.length > 0 : false;

  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const filteredFactions = useMemo(() => {
    if (factions && debouncedQuery) {
      return factions.filter((faction) =>
        faction.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    } else if (factions && !debouncedQuery) {
      return factions;
    }

    return [];
  }, [factions, debouncedQuery]);

  const groupedFactions = useMemo(
    () =>
      filteredFactions.reduce((acc, faction) => {
        const allianceKey = getFactionAlliance(faction.id).toLowerCase();
        const allianceFactions = acc[allianceKey] || [];

        return {
          ...acc,
          [allianceKey]: [...allianceFactions, faction]
        };
      }, {} as GroupedFactions),
    [filteredFactions]
  );

  return (
    <Layout title="Home" isLoading={loadingFactions}>
      <Tabs
        tabs={[hasMyFactions ? 'Favourites' : '', 'All Factions']}
        active={activeTab}
        onChange={setActiveTab}
      >
        {hasMyFactions && (
          <Grid>
            {myFactions?.map((faction) => (
              <LinkCard key={`my-faction-${faction.id}`} to={`/faction/${faction.id}`}>
                {faction.name}
              </LinkCard>
            ))}
          </Grid>
        )}
        <>
          <Filters showClear={!!query} onClear={() => setQuery('')}>
            <Search label="Search by name" value={query} onChange={setQuery} />
          </Filters>
          {Object.keys(groupedFactions).map((key) => (
            <div key={`alliance-${key}`} className={styles.faction}>
              <div className={styles.heading}>
                <h2>{key}</h2>
              </div>
              <Grid>
                {groupedFactions[key].map((faction) => (
                  <LinkCard key={`faction-${faction.id}`} to={`/faction/${faction.id}`}>
                    {faction.name}
                  </LinkCard>
                ))}
              </Grid>
            </div>
          ))}
        </>
      </Tabs>
    </Layout>
  );
};

export default Home;
