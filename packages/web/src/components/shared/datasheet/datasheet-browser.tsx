import type { ReactNode, FC } from 'react';
import type { depot } from '@depot/core';
import { LinkCard } from '@/components/ui';
import Tag from '@/components/ui/tag';
import { useDatasheetBrowser, type DatasheetFilters } from '@/hooks/use-datasheet-browser';
import DatasheetRoleTabs from './datasheet-role-tabs';
import DatasheetFilterBar from './datasheet-filter-bar';
import DatasheetResultsGrid from './datasheet-results-grid';
import DatasheetEmptyState from './datasheet-empty-state';

interface DatasheetBrowserProps {
  datasheets: depot.Datasheet[];
  renderDatasheet?: (datasheet: depot.Datasheet) => ReactNode;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  showItemCount?: boolean;
  filters?: DatasheetFilters;
  initialRole?: string | null;
}

export const DatasheetBrowser: FC<DatasheetBrowserProps> = ({
  datasheets,
  renderDatasheet,
  searchPlaceholder = 'Search datasheets...',
  emptyStateMessage = 'No datasheets found.',
  showItemCount = true,
  filters,
  initialRole = null
}) => {
  const {
    query,
    setQuery,
    debouncedQuery,
    activeRole,
    setActiveRole,
    tabs,
    filteredDatasheets,
    hasResults,
    totalCount,
    clearFilters
  } = useDatasheetBrowser(datasheets, filters, 300, initialRole);

  const defaultRenderDatasheet = (datasheet: depot.Datasheet) => (
    <LinkCard to={`/faction/${datasheet.factionSlug}/datasheet/${datasheet.slug}`}>
      <div className="flex flex-col gap-1">
        <span>{datasheet.name}</span>
        {datasheet.isLegends || datasheet.isForgeWorld ? (
          <Tag
            size="sm"
            variant={datasheet.isLegends ? 'warning' : 'secondary'}
            className="self-start"
          >
            {datasheet.isLegends ? 'Warhammer Legends' : 'Forge World'}
          </Tag>
        ) : null}
      </div>
    </LinkCard>
  );

  const renderItem = renderDatasheet || defaultRenderDatasheet;
  const isRoleFiltered = activeRole !== initialRole;
  const showClear = Boolean(query.trim()) || isRoleFiltered;
  const emptyMessage =
    debouncedQuery || isRoleFiltered
      ? 'No datasheets found matching your filters.'
      : emptyStateMessage;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <DatasheetRoleTabs tabs={tabs} activeRole={activeRole} onChange={setActiveRole} />
        <DatasheetFilterBar
          query={query}
          onQueryChange={setQuery}
          onClear={clearFilters}
          searchPlaceholder={searchPlaceholder}
          showClear={showClear}
        />
        {showItemCount ? (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredDatasheets.length} of {totalCount} datasheets
          </span>
        ) : null}
      </div>

      {hasResults ? (
        <DatasheetResultsGrid>
          {filteredDatasheets.map((datasheet) => (
            <div key={datasheet.slug}>{renderItem(datasheet)}</div>
          ))}
        </DatasheetResultsGrid>
      ) : (
        <DatasheetEmptyState message={emptyMessage} />
      )}
    </div>
  );
};
