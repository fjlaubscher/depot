import { useMemo, useState } from 'react';
import { Grid, IconButton, Tabs, useLocalStorage } from '@fjlaubscher/matter';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';

// components
import Filters from '../../components/filters';
import Layout from '../../components/layout';
import LinkCard from '../../components/card/link';
import Search from '../../components/search';

// data
import DataIndexAtom from '../../components/data-provider/index-atom';

// helpers
import { getFactionAlliance } from '../../utils/faction';

// hooks
import useDebounce from '../../hooks/use-debounce';

import styles from './home.module.scss';
interface GroupedFactions {
  [key: string]: Option[];
}

const Home = () => {
  const navigate = useNavigate();
  const factions = useRecoilValue(DataIndexAtom);

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
    <Layout
      title="Home"
      action={
        <IconButton onClick={() => navigate('/settings')}>
          <FaCog />
        </IconButton>
      }
    >
      <Tabs
        className={styles.tabs}
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
