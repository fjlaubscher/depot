import { type ReactNode, useMemo, useState } from 'react';
import { useDatasheetBrowser, type DatasheetFilters } from '@/hooks/use-datasheet-browser';
import { useSupplementSelectionGuard } from '@/hooks/use-supplement-selection-guard';
import { useSupplementState } from '@/hooks/use-supplement-state';
import type { DatasheetListItem } from '@/types/datasheets';
import DatasheetSupplementTabs, {
  type SupplementTab as SupplementTabsOption
} from './datasheet-supplement-tabs';
import DatasheetRoleTabs from './datasheet-role-tabs';
import DatasheetFilterBar from './datasheet-filter-bar';
import DatasheetResultsGrid from './datasheet-results-grid';
import DatasheetEmptyState from './datasheet-empty-state';
import { sortDatasheetsBySupplementPreference } from '@depot/core/utils/datasheets';
import DatasheetListItemCard from './datasheet-list-item-card';

interface DatasheetBrowserProps<T extends DatasheetListItem> {
  datasheets: T[];
  renderDatasheet?: (datasheet: T) => ReactNode;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  showItemCount?: boolean;
  filters?: DatasheetFilters;
  initialRole?: string | null;
}

const formatRoleLabel = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  return value
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ');
};

export const DatasheetBrowser = <T extends DatasheetListItem>({
  datasheets,
  renderDatasheet,
  searchPlaceholder = 'Search datasheets...',
  emptyStateMessage = 'No datasheets found.',
  showItemCount = true,
  filters,
  initialRole = null
}: DatasheetBrowserProps<T>) => {
  const [selectedSupplement, setSelectedSupplement] = useState<string>('all');

  const {
    supplementMetadata,
    normalizedSelectedSupplement,
    supplementTabs,
    activeSupplementDatasheets,
    supplementFilteredDatasheets,
    filteredActiveSupplementDatasheets,
    supplementSummary
  } = useSupplementState<T>({
    datasheets,
    filters,
    selectedSupplement
  });

  useSupplementSelectionGuard({
    filters,
    supplementMetadata,
    normalizedSelectedSupplement,
    activeSupplementDatasheets,
    filteredActiveSupplementDatasheets,
    onResetSelection: () => setSelectedSupplement('all')
  });

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
  } = useDatasheetBrowser<T>(supplementFilteredDatasheets, filters, 300, initialRole ?? null);

  const visibleDatasheets = useMemo(() => {
    return sortDatasheetsBySupplementPreference(
      filteredDatasheets,
      normalizedSelectedSupplement,
      supplementMetadata.hasSupplements
    );
  }, [filteredDatasheets, normalizedSelectedSupplement, supplementMetadata.hasSupplements]);

  const handleSupplementChange = (value: string) => {
    setSelectedSupplement(value);
  };

  const handleClearFilters = () => {
    setSelectedSupplement('all');
    clearFilters();
  };

  const defaultRenderDatasheet = (datasheet: DatasheetListItem) => (
    <DatasheetListItemCard
      datasheet={datasheet}
      roleLabel={datasheet.roleLabel ?? formatRoleLabel(datasheet.role)}
      supplementMetadataHasSupplements={supplementMetadata.hasSupplements}
    />
  );

  const renderItem: (datasheet: T) => ReactNode =
    renderDatasheet ?? ((item) => defaultRenderDatasheet(item));
  const isRoleFiltered = activeRole !== initialRole;
  const isSupplementFiltered =
    supplementMetadata.hasSupplements && normalizedSelectedSupplement !== 'all';
  const showClear = Boolean(query.trim()) || isRoleFiltered || isSupplementFiltered;
  const emptyMessage =
    debouncedQuery || isRoleFiltered
      ? 'No datasheets found matching your filters.'
      : emptyStateMessage;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {supplementTabs.length > 0 ? (
          <DatasheetSupplementTabs
            tabs={supplementTabs}
            activeValue={normalizedSelectedSupplement}
            onChange={handleSupplementChange}
          />
        ) : null}

        <DatasheetRoleTabs tabs={tabs} activeRole={activeRole} onChange={setActiveRole} />
        <DatasheetFilterBar
          query={query}
          onQueryChange={setQuery}
          onClear={handleClearFilters}
          searchPlaceholder={searchPlaceholder}
          showClear={showClear}
          searchTestId="datasheet-search"
          clearTestId="datasheet-search-clear"
        />
        {supplementSummary ? (
          <span className="text-xs text-subtle" data-testid="supplement-summary">
            {supplementSummary}
          </span>
        ) : null}
        {showItemCount ? (
          <span className="text-sm text-subtle">
            Showing {visibleDatasheets.length} of {totalCount} datasheets
            {isSupplementFiltered ? ` (from ${datasheets.length} total)` : ''}
          </span>
        ) : null}
      </div>

      {hasResults ? (
        <DatasheetResultsGrid>
          {visibleDatasheets.map((datasheet) => (
            <div key={datasheet.slug} id={datasheet.id}>
              {renderItem(datasheet)}
            </div>
          ))}
        </DatasheetResultsGrid>
      ) : (
        <DatasheetEmptyState message={emptyMessage} />
      )}
    </div>
  );
};
