import { type ReactNode, useMemo, useState } from 'react';
import { LinkCard } from '@/components/ui';
import Tag from '@/components/ui/tag';
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
import {
  CODEX_SLUG,
  buildSupplementLabel,
  getSupplementKey,
  isSupplementEntry,
  sortDatasheetsBySupplementPreference
} from '@/utils/datasheet-supplements';
import { getSupplementStyles } from '@/utils/supplement-styles';

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
    codexDatasheets,
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

  const defaultRenderDatasheet = (datasheet: DatasheetListItem) => {
    const tags: ReactNode[] = [];
    const roleLabel = datasheet.roleLabel ?? formatRoleLabel(datasheet.role);

    if (roleLabel) {
      tags.push(
        <Tag key="role" size="sm" variant="default">
          {roleLabel}
        </Tag>
      );
    }

    if (supplementMetadata.hasSupplements && isSupplementEntry(datasheet)) {
      const supplementKey = getSupplementKey(datasheet);
      const supplementStyles = getSupplementStyles(supplementKey);
      const label = datasheet.supplementLabel
        ? datasheet.supplementLabel
        : buildSupplementLabel(datasheet.supplementSlug ?? CODEX_SLUG, datasheet.supplementName);
      tags.push(
        <Tag
          key="supplement"
          size="sm"
          variant="default"
          className={supplementStyles.tagClass}
          data-supplement-key={supplementKey}
        >
          {label}
        </Tag>
      );
    }

    if (datasheet.isLegends) {
      tags.push(
        <Tag key="legends" size="sm" variant="warning">
          Warhammer Legends
        </Tag>
      );
    }

    if (datasheet.isForgeWorld) {
      tags.push(
        <Tag key="forgeWorld" size="sm" variant="secondary">
          Forge World
        </Tag>
      );
    }

    return (
      <LinkCard to={`/faction/${datasheet.factionSlug}/datasheet/${datasheet.slug}`}>
        <div className="flex flex-col gap-2">
          <span className="font-medium">{datasheet.name}</span>
          {tags.length > 0 ? <div className="flex flex-wrap gap-2">{tags}</div> : null}
        </div>
      </LinkCard>
    );
  };

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
            <div key={datasheet.slug}>{renderItem(datasheet)}</div>
          ))}
        </DatasheetResultsGrid>
      ) : (
        <DatasheetEmptyState message={emptyMessage} />
      )}
    </div>
  );
};
