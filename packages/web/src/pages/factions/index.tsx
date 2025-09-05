import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';

// Context hooks
import { useAppContext } from '@/contexts/app/use-app-context';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, ErrorState } from '@/components/ui';

// Page components
import LoadingSkeleton from './components/loading-skeleton';
import AllianceSection from './components/alliance-section';
import SearchFilters from './components/search-filters';
import NoResults from './components/no-results';

// Utilities
import {
  filterFactionsByQuery,
  filterFactionsBySettings,
  groupFactionsByAlliance
} from './utils/faction';

// Custom hooks
import useDebounce from '@/hooks/use-debounce';

const Factions: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const filteredFactions = useMemo(() => {
    const queryFiltered = filterFactionsByQuery(state.factionIndex, debouncedQuery);
    return filterFactionsBySettings(queryFiltered, state.settings);
  }, [state.factionIndex, debouncedQuery, state.settings]);

  const groupedFactions = useMemo(
    () => groupFactionsByAlliance(filteredFactions),
    [filteredFactions]
  );

  const hasResults = Object.keys(groupedFactions).length > 0;
  const totalFactions = filteredFactions.length;
  const totalAlliances = Object.keys(groupedFactions).length;

  if (state.loading) {
    return <LoadingSkeleton />;
  }

  if (state.error) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Factions"
          message="We encountered an error while trying to load the factions data. This could be due to network issues or server problems."
          stackTrace={state.error}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Factions">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Factions"
          subtitle={`Browse ${totalFactions} factions across ${totalAlliances} alliances`}
        />

        <SearchFilters query={query} onQueryChange={setQuery} onClear={() => setQuery('')} />

        {hasResults ? (
          <div className="flex flex-col gap-4">
            {Object.keys(groupedFactions).map((allianceKey) => (
              <AllianceSection
                key={`alliance-${allianceKey}`}
                alliance={allianceKey}
                factions={groupedFactions[allianceKey]}
              />
            ))}
          </div>
        ) : debouncedQuery ? (
          <NoResults query={debouncedQuery} />
        ) : null}
      </div>
    </AppLayout>
  );
};

export default Factions;
