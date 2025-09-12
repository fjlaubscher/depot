import React, { ReactNode } from 'react';
import { depot } from '@depot/core';
import { Search, Filters, CollapsibleSection } from '@/components/ui';
import { useDatasheetSearch } from '@/hooks/use-datasheet-search';

interface DatasheetBrowserProps {
  datasheets: depot.Datasheet[];
  renderDatasheet: (datasheet: depot.Datasheet) => ReactNode;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  showItemCount?: boolean;
}

export const DatasheetBrowser: React.FC<DatasheetBrowserProps> = ({
  datasheets,
  renderDatasheet,
  searchPlaceholder = 'Search datasheets...',
  emptyStateMessage = 'No datasheets found.',
  showItemCount = true
}) => {
  const {
    query,
    setQuery,
    debouncedQuery,
    groupedDatasheets,
    sortedRoleKeys,
    shouldExpandSection,
    hasResults
  } = useDatasheetSearch(datasheets);

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
                defaultExpanded={shouldExpandSection[role] || !debouncedQuery}
                className="border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex flex-col gap-2">
                  {groupedDatasheets[role].map((datasheet) => (
                    <div key={datasheet.id}>{renderDatasheet(datasheet)}</div>
                  ))}
                </div>
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
