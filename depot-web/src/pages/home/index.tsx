import React, { useMemo, useState } from 'react';

// components
import Alert from '../../components/alert';
import Grid from '../../components/grid';
import Filters from '../../components/filters';
import Layout from '../../components/layout';
import LinkCard from '../../components/card/link';
import Search from '../../components/search';

// hooks
import useFactions from '../../hooks/use-factions';
import useDebounce from '../../hooks/use-debounce';

const Home = () => {
  const { data: factions, loading: loadingFactions } = useFactions();
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

  return (
    <Layout title="Home" isLoading={loadingFactions}>
      <Alert title="Hey! 👋">
        <p>depot is a free and open-source Warhammer: 40,000 companion app powered by Wahapedia!</p>
        <a href="https://github.com/fjlaubscher/depot" target="_blank" rel="noopener">
          https://github.com/fjlaubscher/depot
        </a>
      </Alert>
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search value={query} onChange={setQuery} />
      </Filters>
      <Grid>
        {filteredFactions.map((faction) => (
          <LinkCard to={`/faction/${faction.id}`}>{faction.name}</LinkCard>
        ))}
      </Grid>
    </Layout>
  );
};

export default Home;
