import { type ReactNode, type FC, useMemo, useState, useEffect, useRef } from 'react';
import type { depot } from '@depot/core';
import { LinkCard } from '@/components/ui';
import Tag from '@/components/ui/tag';
import { useDatasheetBrowser, type DatasheetFilters } from '@/hooks/use-datasheet-browser';
import DatasheetSupplementTabs, {
  type SupplementTab as SupplementTabsOption
} from './datasheet-supplement-tabs';
import DatasheetRoleTabs from './datasheet-role-tabs';
import DatasheetFilterBar from './datasheet-filter-bar';
import DatasheetResultsGrid from './datasheet-results-grid';
import DatasheetEmptyState from './datasheet-empty-state';
import { filterDatasheetsBySettings } from '@/utils/datasheet-filters';
import {
  CODEX_SLUG,
  buildSupplementLabel,
  deriveSupplementMetadata,
  filterDatasheetsBySupplement,
  isCodexEntry,
  normalizeSupplementValue,
  shouldResetSupplementSelection
} from '@/utils/datasheet-supplements';

interface DatasheetBrowserProps {
  datasheets: depot.Datasheet[];
  renderDatasheet?: (datasheet: depot.Datasheet) => ReactNode;
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

export const DatasheetBrowser: FC<DatasheetBrowserProps> = ({
  datasheets,
  renderDatasheet,
  searchPlaceholder = 'Search datasheets...',
  emptyStateMessage = 'No datasheets found.',
  showItemCount = true,
  filters,
  initialRole = null
}) => {
  const [selectedSupplement, setSelectedSupplement] = useState<string>('all');

  const supplementMetadata = useMemo(() => deriveSupplementMetadata(datasheets), [datasheets]);
  const normalizedSelectedSupplement = useMemo(
    () => normalizeSupplementValue(selectedSupplement || 'all'),
    [selectedSupplement]
  );
  const supplementTabs = useMemo<SupplementTabsOption[]>(() => {
    if (!supplementMetadata.hasSupplements) {
      return [];
    }

    return supplementMetadata.options;
  }, [supplementMetadata]);

  useEffect(() => {
    if (!supplementMetadata.hasSupplements && selectedSupplement !== 'all') {
      setSelectedSupplement('all');
    }
  }, [supplementMetadata.hasSupplements, selectedSupplement]);

  const codexDatasheets = useMemo(() => {
    if (!supplementMetadata.hasSupplements) {
      return [];
    }

    return datasheets.filter((sheet) => isCodexEntry(sheet.supplementSlug));
  }, [datasheets, supplementMetadata.hasSupplements]);

  const activeSupplementDatasheets = useMemo(() => {
    if (!supplementMetadata.hasSupplements) {
      return [];
    }

    if (normalizedSelectedSupplement === 'all') {
      return [];
    }

    if (normalizedSelectedSupplement === CODEX_SLUG) {
      return codexDatasheets;
    }

    return datasheets.filter((sheet) => {
      if (!sheet.supplementSlug) {
        return false;
      }

      return normalizeSupplementValue(sheet.supplementSlug) === normalizedSelectedSupplement;
    });
  }, [
    codexDatasheets,
    datasheets,
    normalizedSelectedSupplement,
    supplementMetadata.hasSupplements
  ]);

  const supplementFilteredDatasheets = useMemo(() => {
    if (!supplementMetadata.hasSupplements) {
      return datasheets;
    }

    return filterDatasheetsBySupplement(datasheets, selectedSupplement);
  }, [datasheets, selectedSupplement, supplementMetadata.hasSupplements]);

  const filteredActiveSupplementDatasheets = useMemo(
    () => filterDatasheetsBySettings(activeSupplementDatasheets, filters),
    [activeSupplementDatasheets, filters]
  );

  const filteredCodexDatasheets = useMemo(() => {
    if (
      !supplementMetadata.hasSupplements ||
      normalizedSelectedSupplement === 'all' ||
      normalizedSelectedSupplement === CODEX_SLUG
    ) {
      return [];
    }

    return filterDatasheetsBySettings(codexDatasheets, filters);
  }, [codexDatasheets, filters, normalizedSelectedSupplement, supplementMetadata.hasSupplements]);

  const selectedSupplementLabel = useMemo(() => {
    if (!supplementMetadata.hasSupplements) {
      return null;
    }

    const option = supplementMetadata.options.find(
      (optionItem) => optionItem.value === selectedSupplement
    );

    if (option) {
      return option.label;
    }

    if (selectedSupplement && selectedSupplement !== 'all') {
      return buildSupplementLabel(selectedSupplement);
    }

    return null;
  }, [selectedSupplement, supplementMetadata.hasSupplements, supplementMetadata.options]);

  const supplementSummary = useMemo(() => {
    if (!supplementMetadata.hasSupplements || normalizedSelectedSupplement === 'all') {
      return null;
    }

    if (!selectedSupplementLabel) {
      return null;
    }

    if (normalizedSelectedSupplement === CODEX_SLUG) {
      return `${selectedSupplementLabel} (core datasheets): ${filteredActiveSupplementDatasheets.length} datasheets`;
    }

    const sharedCount = filteredCodexDatasheets.length;
    const primaryCount = filteredActiveSupplementDatasheets.length;

    if (sharedCount === 0) {
      return `${selectedSupplementLabel}: ${primaryCount} datasheets`;
    }

    return `${selectedSupplementLabel}: ${primaryCount} datasheets + ${sharedCount} shared core datasheets`;
  }, [
    filteredActiveSupplementDatasheets.length,
    filteredCodexDatasheets.length,
    normalizedSelectedSupplement,
    selectedSupplementLabel,
    supplementMetadata.hasSupplements
  ]);

  const prevFiltersRef = useRef<DatasheetFilters | undefined>(filters);
  const prevActiveSupplementDatasheetsRef = useRef<depot.Datasheet[]>(activeSupplementDatasheets);

  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const prevActiveDatasheets = prevActiveSupplementDatasheetsRef.current;

    prevFiltersRef.current = filters;
    prevActiveSupplementDatasheetsRef.current = activeSupplementDatasheets;

    if (!supplementMetadata.hasSupplements || normalizedSelectedSupplement === 'all') {
      return;
    }

    const lostActiveDatasheets =
      prevActiveDatasheets.length > 0 && activeSupplementDatasheets.length === 0;

    if (lostActiveDatasheets) {
      setSelectedSupplement('all');
      return;
    }

    const filtersInitialized = prevFilters !== undefined;
    const legendsChanged = prevFilters?.showLegends !== filters?.showLegends;
    const forgeWorldChanged = prevFilters?.showForgeWorld !== filters?.showForgeWorld;

    if (!filtersInitialized || (!legendsChanged && !forgeWorldChanged)) {
      return;
    }

    if (
      shouldResetSupplementSelection(activeSupplementDatasheets, filteredActiveSupplementDatasheets)
    ) {
      setSelectedSupplement('all');
    }
  }, [
    activeSupplementDatasheets,
    filteredActiveSupplementDatasheets,
    filters,
    normalizedSelectedSupplement,
    supplementMetadata.hasSupplements
  ]);

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
  } = useDatasheetBrowser(supplementFilteredDatasheets, filters, 300, initialRole);

  const visibleDatasheets = useMemo(() => {
    if (!supplementMetadata.hasSupplements || normalizedSelectedSupplement === 'all') {
      return filteredDatasheets;
    }

    const getPriority = (sheet: depot.Datasheet) => {
      const slug = sheet.supplementSlug
        ? normalizeSupplementValue(sheet.supplementSlug)
        : CODEX_SLUG;

      if (normalizedSelectedSupplement === CODEX_SLUG) {
        return slug === CODEX_SLUG ? 0 : 1;
      }

      return slug === normalizedSelectedSupplement ? 0 : 1;
    };

    return filteredDatasheets.slice().sort((a, b) => {
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredDatasheets, normalizedSelectedSupplement, supplementMetadata.hasSupplements]);

  const handleSupplementChange = (value: string) => {
    setSelectedSupplement(value);
  };

  const handleClearFilters = () => {
    setSelectedSupplement('all');
    clearFilters();
  };

  const defaultRenderDatasheet = (datasheet: depot.Datasheet) => {
    const tags: ReactNode[] = [];
    const roleLabel = formatRoleLabel(datasheet.role);

    if (roleLabel) {
      tags.push(
        <Tag key="role" size="sm" variant="default">
          {roleLabel}
        </Tag>
      );
    }

    if (
      supplementMetadata.hasSupplements &&
      datasheet.supplementSlug &&
      normalizeSupplementValue(datasheet.supplementSlug) !== CODEX_SLUG
    ) {
      const rawSlug = datasheet.supplementSlug;
      const label = buildSupplementLabel(rawSlug, datasheet.supplementName);
      tags.push(
        <Tag key="supplement" size="sm" variant="primary">
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

  const renderItem = renderDatasheet || defaultRenderDatasheet;
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
