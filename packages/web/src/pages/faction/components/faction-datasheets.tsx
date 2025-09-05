import React, { useMemo, useState } from 'react';
import { depot } from '@depot/core';

// UI Components
import Grid from '@/components/ui/grid';
import Search from '@/components/ui/search';
import Filters from '@/components/ui/filters';
import LinkCard from '@/components/ui/link-card';
import { CollapsibleSection } from '@/components/ui';

// Hooks
import { useAppContext } from '@/contexts/app/use-app-context';
import useDebounce from '@/hooks/use-debounce';

// Utils
import { groupDatasheetsByRole } from '@/utils/datasheet';

interface FactionDatasheetsProps {
  datasheets: depot.Datasheet[];
}

const FactionDatasheets: React.FC<FactionDatasheetsProps> = ({ datasheets }) => {
  const { state } = useAppContext();
  const { settings } = state;
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  const groupedDatasheets = useMemo(() => {
    let filteredDatasheets = datasheets;

    if (!settings?.showLegends) {
      filteredDatasheets = filteredDatasheets.filter((ds) => ds.isLegends === false);
    }

    if (!settings?.showForgeWorld) {
      filteredDatasheets = filteredDatasheets.filter((ds) => ds.isForgeWorld === false);
    }

    filteredDatasheets = debouncedQuery
      ? filteredDatasheets.filter((ds) =>
          ds.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      : filteredDatasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, debouncedQuery, settings]);

  const sortedRoleKeys = useMemo(() => {
    return Object.keys(groupedDatasheets).sort();
  }, [groupedDatasheets]);

  const shouldExpandSection = useMemo(() => {
    // If there's a search query, expand sections that have results
    if (debouncedQuery) {
      const expandedSections: { [key: string]: boolean } = {};
      sortedRoleKeys.forEach((key) => {
        expandedSections[key] = groupedDatasheets[key].length > 0;
      });
      return expandedSections;
    }
    // If no search query, collapse all sections
    return {};
  }, [debouncedQuery, sortedRoleKeys, groupedDatasheets]);

  return (
    <div className="flex flex-col gap-6" data-testid="faction-datasheets">
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search label="Search datasheets by name" value={query} onChange={setQuery} />
      </Filters>

      <div className="flex flex-col gap-4">
        {sortedRoleKeys.map((key) =>
          groupedDatasheets[key].length ? (
            <CollapsibleSection
              key={`${key}-${!!debouncedQuery}`}
              title={key.toUpperCase()}
              defaultExpanded={shouldExpandSection[key] || false}
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <Grid>
                {groupedDatasheets[key].map((ds) => (
                  <LinkCard key={ds.id} to={`/faction/${ds.factionId}/datasheet/${ds.id}`}>
                    {ds.name}
                  </LinkCard>
                ))}
              </Grid>
            </CollapsibleSection>
          ) : null
        )}
      </div>

      {Object.keys(groupedDatasheets).every((key) => groupedDatasheets[key].length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No datasheets found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default FactionDatasheets;
