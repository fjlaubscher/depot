import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { sortByName } from '@depot/core/utils/common';
import {
  CODEX_SLUG,
  type DatasheetListItem,
  type DatasheetVisibilityFilters,
  buildSupplementLabel,
  deriveSupplementMetadata,
  filterDatasheetsBySettings,
  filterDatasheetsBySupplement,
  getSupplementKey,
  isSupplementEntry,
  normalizeSupplementValue,
  shouldResetSupplementSelection,
  sortDatasheetsBySupplementPreference
} from '@depot/core/utils/datasheets';
import {
  BATTLEFIELD_ROLES,
  BATTLEFIELD_ROLE_LABELS,
  getListItemRole
} from '@depot/core/utils/datasheets';
import { Filters, Search, SectionHeader } from '@/components/ui';
import useDebounce from '@/hooks/use-debounce';
import { cx } from '@/utils/cx';
import DatasheetSupplementTabs from './datasheet-supplement-tabs';
import DatasheetListItemCard from './datasheet-list-item-card';

interface DatasheetBrowserProps<T extends DatasheetListItem> {
  datasheets: T[];
  renderDatasheet?: (datasheet: T) => ReactNode;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  showItemCount?: boolean;
  filters?: DatasheetVisibilityFilters;
  /** Extra classes on the results list (e.g. bottom gap so a floating chip clears the last card). */
  resultsClassName?: string;
}

const deriveSupplementState = <T extends DatasheetListItem>(
  datasheets: T[],
  filters: DatasheetVisibilityFilters | undefined,
  selectedSupplement: string
) => {
  const metadata = deriveSupplementMetadata(filterDatasheetsBySettings(datasheets, filters));
  const selected = normalizeSupplementValue(selectedSupplement || 'all');
  const isFiltered = metadata.hasSupplements && selected !== 'all';
  const codexDatasheets = metadata.hasSupplements
    ? datasheets.filter((sheet) => !isSupplementEntry(sheet))
    : [];
  const activeDatasheets = !isFiltered
    ? []
    : selected === CODEX_SLUG
      ? codexDatasheets
      : datasheets.filter(
          (sheet) => isSupplementEntry(sheet) && getSupplementKey(sheet) === selected
        );
  const filteredActive = filterDatasheetsBySettings(activeDatasheets, filters);

  const label = !metadata.hasSupplements
    ? null
    : (metadata.options.find((option) => option.value === selectedSupplement)?.label ??
      (selectedSupplement && selected !== 'all' ? buildSupplementLabel(selectedSupplement) : null));

  let summary: string | null = null;
  if (isFiltered && label) {
    if (selected === CODEX_SLUG) {
      summary = `${label} (core datasheets): ${filteredActive.length} datasheets`;
    } else {
      const shared = filterDatasheetsBySettings(codexDatasheets, filters).length;
      summary =
        shared === 0
          ? `${label}: ${filteredActive.length} datasheets`
          : `${label}: ${filteredActive.length} datasheets + ${shared} shared core datasheets`;
    }
  }

  return {
    hasSupplements: metadata.hasSupplements,
    tabs: metadata.hasSupplements ? metadata.options : [],
    selected,
    isFiltered,
    activeDatasheets,
    filteredActive,
    datasheets: metadata.hasSupplements
      ? filterDatasheetsBySupplement(datasheets, selectedSupplement)
      : datasheets,
    summary
  };
};

export const DatasheetBrowser = <T extends DatasheetListItem>({
  datasheets,
  renderDatasheet,
  searchPlaceholder = 'Search datasheets...',
  emptyStateMessage = 'No datasheets found.',
  showItemCount = true,
  filters,
  resultsClassName
}: DatasheetBrowserProps<T>) => {
  const [selectedSupplement, setSelectedSupplement] = useState('all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const supplement = useMemo(
    () => deriveSupplementState(datasheets, filters, selectedSupplement),
    [datasheets, filters, selectedSupplement]
  );

  // Drop back to "all" when the selected supplement loses every visible datasheet
  // (e.g. legends/forge world toggled off).
  const prevFiltersRef = useRef(filters);
  const prevActiveRef = useRef(supplement.activeDatasheets);
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const prevActive = prevActiveRef.current;
    prevFiltersRef.current = filters;
    prevActiveRef.current = supplement.activeDatasheets;

    if (!supplement.isFiltered) return;

    if (prevActive.length > 0 && supplement.activeDatasheets.length === 0) {
      setSelectedSupplement('all');
      return;
    }

    const filtersChanged =
      prevFilters !== undefined &&
      (prevFilters.showLegends !== filters?.showLegends ||
        prevFilters.showForgeWorld !== filters?.showForgeWorld);

    if (
      filtersChanged &&
      shouldResetSupplementSelection(supplement.activeDatasheets, supplement.filteredActive)
    ) {
      setSelectedSupplement('all');
    }
  }, [filters, supplement]);

  const filteredBySettings = useMemo(
    () => filterDatasheetsBySettings(supplement.datasheets, filters),
    [filters, supplement.datasheets]
  );

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const visibleDatasheets = useMemo(() => {
    const matches = normalizedQuery
      ? filteredBySettings.filter((sheet) => sheet.name.toLowerCase().includes(normalizedQuery))
      : filteredBySettings;
    return sortDatasheetsBySupplementPreference(
      sortByName(matches),
      supplement.selected,
      supplement.hasSupplements
    );
  }, [filteredBySettings, normalizedQuery, supplement.selected, supplement.hasSupplements]);

  const handleClearFilters = () => {
    setSelectedSupplement('all');
    setQuery('');
  };

  const renderItem: (datasheet: T) => ReactNode =
    renderDatasheet ??
    ((datasheet) => (
      <DatasheetListItemCard
        datasheet={datasheet}
        supplementMetadataHasSupplements={supplement.hasSupplements}
      />
    ));

  // Only the default row list groups by role; custom renderers (the add-units
  // picker) are flat by design.
  const roleSections = useMemo(() => {
    if (renderDatasheet) return null;
    // Manifests generated before `role` existed report everything as "other";
    // stay flat rather than showing one meaningless section.
    if (!visibleDatasheets.some((sheet) => getListItemRole(sheet) !== 'other')) return null;

    const byRole = new Map<string, T[]>();
    for (const sheet of visibleDatasheets) {
      const role = getListItemRole(sheet);
      byRole.set(role, [...(byRole.get(role) ?? []), sheet]);
    }
    return BATTLEFIELD_ROLES.filter((role) => byRole.has(role)).map((role) => ({
      role,
      sheets: byRole.get(role)!
    }));
  }, [renderDatasheet, visibleDatasheets]);

  const showClear = Boolean(query.trim()) || supplement.isFiltered;
  const emptyMessage = debouncedQuery
    ? 'No datasheets found matching your filters.'
    : emptyStateMessage;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {supplement.tabs.length > 0 ? (
          <DatasheetSupplementTabs
            tabs={supplement.tabs}
            activeValue={supplement.selected}
            onChange={setSelectedSupplement}
          />
        ) : null}

        <Filters
          showClear={showClear}
          onClear={handleClearFilters}
          clearTestId="datasheet-search-clear"
        >
          <Search
            label="Search datasheets"
            value={query}
            onChange={setQuery}
            placeholder={searchPlaceholder}
            testId="datasheet-search"
            className="w-full"
          />
        </Filters>
        {supplement.summary ? (
          <span className="text-xs text-subtle" data-testid="supplement-summary">
            {supplement.summary}
          </span>
        ) : null}
        {showItemCount ? (
          <span className="text-sm text-subtle">
            Showing {visibleDatasheets.length} of {filteredBySettings.length} datasheets
            {supplement.isFiltered ? ` (from ${datasheets.length} total)` : ''}
          </span>
        ) : null}
      </div>

      {visibleDatasheets.length > 0 ? (
        <div
          className={cx('flex flex-col gap-2', resultsClassName)}
          aria-live="polite"
          id="datasheet-results"
        >
          {roleSections
            ? roleSections.map(({ role, sheets }) => (
                <section key={role} className="flex flex-col gap-0.5">
                  <SectionHeader title={BATTLEFIELD_ROLE_LABELS[role]} count={sheets.length} />
                  <div className="divide-y divide-border-subtle">
                    {sheets.map((datasheet) => (
                      <div key={datasheet.slug} id={datasheet.id}>
                        {renderItem(datasheet)}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            : visibleDatasheets.map((datasheet) => (
                <div key={datasheet.slug} id={datasheet.id}>
                  {renderItem(datasheet)}
                </div>
              ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-subtle">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};
