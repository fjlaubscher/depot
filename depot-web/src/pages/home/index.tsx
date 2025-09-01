import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import { depot } from 'depot-core';

// Context hooks
import { useAppContext } from '@/contexts/app/use-app-context';

// UI Components
import Layout from '@/components/ui/layout';
import IconButton from '@/components/ui/icon-button';
import Tabs from '@/components/ui/tabs';

// Page components
import LoadingSkeleton from './components/loading-skeleton';
import ErrorState from './components/error-state';
import MyFactionsTab from './components/my-factions-tab';
import AllFactionsTab from './components/all-factions-tab';

// Utilities
import {
  filterFactionsByQuery,
  groupFactionsByAlliance,
  createTabLabels,
  hasMyFactions
} from './utils/faction';

// Custom hooks
import useDebounce from '@/hooks/use-debounce';
import useLocalStorage from '@/hooks/use-local-storage';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const [myFactions] = useLocalStorage<depot.Index[]>('my-factions');
  const hasFactions = hasMyFactions(myFactions);

  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const filteredFactions = useMemo(
    () => filterFactionsByQuery(state.factionIndex, debouncedQuery),
    [state.factionIndex, debouncedQuery]
  );

  const groupedFactions = useMemo(
    () => groupFactionsByAlliance(filteredFactions),
    [filteredFactions]
  );

  if (state.loading) {
    return <LoadingSkeleton />;
  }

  if (state.error) {
    return <ErrorState error={state.error} />;
  }

  const tabLabels = createTabLabels(hasFactions);

  return (
    <Layout
      title="Home"
      action={
        <IconButton onClick={() => navigate('/settings')} aria-label="Open settings">
          <FaCog />
        </IconButton>
      }
    >
      <Tabs tabs={tabLabels} active={activeTab} onChange={setActiveTab}>
        {hasFactions && <MyFactionsTab factions={myFactions || []} />}

        <AllFactionsTab
          groupedFactions={groupedFactions}
          query={query}
          onQueryChange={setQuery}
          onClear={() => setQuery('')}
          debouncedQuery={debouncedQuery}
        />
      </Tabs>
    </Layout>
  );
};

export default Home;
