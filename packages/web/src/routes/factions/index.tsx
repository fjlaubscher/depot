import React, { useEffect, useMemo, useState } from 'react';

// Context hooks
import useFactionIndex from '@/hooks/use-faction-index';
import useSettings from '@/hooks/use-settings';

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
  const { factionIndex, loading, error, checkForDataUpdates } = useFactionIndex();
  const { settings } = useSettings();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  useEffect(() => {
    void checkForDataUpdates();
  }, [checkForDataUpdates]);

  const filteredFactions = useMemo(() => {
    const queryFiltered = filterFactionsByQuery(factionIndex, debouncedQuery);
    return filterFactionsBySettings(queryFiltered, settings);
  }, [factionIndex, debouncedQuery, settings]);

  const groupedFactions = useMemo(
    () => groupFactionsByAlliance(filteredFactions),
    [filteredFactions]
  );

  const hasResults = Object.keys(groupedFactions).length > 0;
  const totalFactions = filteredFactions.length;
  const totalAlliances = Object.keys(groupedFactions).length;

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Factions"
          message="We encountered an error while trying to load the factions data. This could be due to network issues or server problems."
          stackTrace={error}
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
