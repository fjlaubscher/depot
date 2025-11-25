import React, { useMemo, useState } from 'react';

// Context hooks
import { useAppContext } from '@/contexts/app/use-app-context';

// UI Components
import AppLayout from '@/components/layout';
import { PageHeader, ErrorState } from '@/components/ui';

// Page components
import Skeleton from './_components/skeleton';
import AllianceSection from './_components/alliance-section';
import SearchFilters from './_components/search-filters';

// Utilities
import {
  filterFactionsByQuery,
  filterFactionsBySettings,
  groupFactionsByAlliance
} from './_utils/faction';

// Custom hooks
import useDebounce from '@/hooks/use-debounce';

const Factions: React.FC = () => {
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
    return <Skeleton />;
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
    <AppLayout title="Browse Factions">
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
          <div className="text-center py-8">
            <p className="text-subtle">No factions found matching "{debouncedQuery}"</p>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default Factions;
