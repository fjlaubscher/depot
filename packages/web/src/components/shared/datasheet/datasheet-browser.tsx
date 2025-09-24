import type { ReactNode, FC } from 'react';
import { depot } from '@depot/core';
import { Search, Filters, CollapsibleSection, Grid, LinkCard } from '@/components/ui';
import { useDatasheetSearch } from '@/hooks/use-datasheet-search';
import type { DatasheetFilters } from '@/hooks/use-datasheet-search';

interface DatasheetBrowserProps {
  datasheets: depot.Datasheet[];
  renderDatasheet?: (datasheet: depot.Datasheet) => ReactNode;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  showItemCount?: boolean;
  filters?: DatasheetFilters;
}

export const DatasheetBrowser: FC<DatasheetBrowserProps> = ({
  datasheets,
  renderDatasheet,
  searchPlaceholder = 'Search datasheets...',
  emptyStateMessage = 'No datasheets found.',
  showItemCount = true,
  filters
}) => {
  const {
    query,
    setQuery,
    debouncedQuery,
    groupedDatasheets,
    sortedRoleKeys,
    shouldExpandSection,
    hasResults
  } = useDatasheetSearch(datasheets, filters);

  const defaultRenderDatasheet = (datasheet: depot.Datasheet) => (
    <LinkCard to={`/faction/${datasheet.factionId}/datasheet/${datasheet.id}`}>
      {datasheet.name}
    </LinkCard>
  );

  const renderItem = renderDatasheet || defaultRenderDatasheet;

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search
          label="Search datasheets"
          value={query}
          onChange={setQuery}
          placeholder={searchPlaceholder}
        />
      </Filters>

      {/* Results */}
      {hasResults ? (
        <div className="flex flex-col gap-4">
          {sortedRoleKeys.map((role) =>
            groupedDatasheets[role].length ? (
              <CollapsibleSection
                key={`${role}-${!!debouncedQuery}`}
                title={
                  showItemCount
                    ? `${role.toUpperCase()} (${groupedDatasheets[role].length})`
                    : role.toUpperCase()
                }
                defaultExpanded={shouldExpandSection[role] || false}
                className="border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <Grid>
                  {groupedDatasheets[role].map((datasheet) => (
                    <div key={datasheet.id}>{renderItem(datasheet)}</div>
                  ))}
                </Grid>
              </CollapsibleSection>
            ) : null
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {debouncedQuery
              ? 'No datasheets found matching your search criteria.'
              : emptyStateMessage}
          </p>
        </div>
      )}
    </div>
  );
};
