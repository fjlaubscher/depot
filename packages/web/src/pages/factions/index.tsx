import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';

// Context hooks
import { useAppContext } from '@/contexts/app/use-app-context';

// UI Components
import AppLayout from '@/components/layout';
import IconButton from '@/components/ui/icon-button';

// Page components
import LoadingSkeleton from './components/loading-skeleton';
import ErrorState from './components/error-state';
import AllianceSection from './components/alliance-section';
import SearchFilters from './components/search-filters';
import NoResults from './components/no-results';

// Utilities
import { filterFactionsByQuery, groupFactionsByAlliance } from './utils/faction';

// Custom hooks
import useDebounce from '@/hooks/use-debounce';

const Factions: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

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

  const hasResults = Object.keys(groupedFactions).length > 0;

  if (state.loading) {
    return <LoadingSkeleton />;
  }

  if (state.error) {
    return <ErrorState error={state.error} />;
  }

  return (
    <AppLayout title="Factions">
      <div className="space-y-4">
        <div className="flex justify-end">
          <IconButton onClick={() => navigate('/settings')} aria-label="Open settings">
            <FaCog />
          </IconButton>
        </div>

        <SearchFilters query={query} onQueryChange={setQuery} onClear={() => setQuery('')} />

        {hasResults ? (
          Object.keys(groupedFactions).map((allianceKey) => (
            <AllianceSection
              key={`alliance-${allianceKey}`}
              alliance={allianceKey}
              factions={groupedFactions[allianceKey]}
            />
          ))
        ) : debouncedQuery ? (
          <NoResults query={debouncedQuery} />
        ) : null}
      </div>
    </AppLayout>
  );
};

export default Factions;
