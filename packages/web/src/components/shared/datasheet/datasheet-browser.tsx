import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sortByName } from '@depot/core/utils/common';
import {
  BATTLEFIELD_ROLES,
  CODEX_SLUG,
  type BattlefieldRole,
  type DatasheetListItem,
  type DatasheetVisibilityFilters,
  buildSupplementLabel,
  deriveSupplementMetadata,
  filterDatasheetsBySettings,
  filterDatasheetsBySupplement,
  getListItemRole,
  getSupplementKey,
  isSupplementEntry,
  normalizeSupplementValue,
  shouldResetSupplementSelection,
  sortDatasheetsBySupplementPreference
} from '@depot/core/utils/datasheets';
import { Grid, Search } from '@/components/ui';
import PillTabs from '@/components/shared/pill-tabs';
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

type RoleTab = 'all' | BattlefieldRole;

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
    label,
    sharedCount:
      selected === CODEX_SLUG ? 0 : filterDatasheetsBySettings(codexDatasheets, filters).length
  };
};

export const DatasheetBrowser = <T extends DatasheetListItem>({
  datasheets,
  renderDatasheet,
  searchPlaceholder,
  emptyStateMessage,
  showItemCount = true,
  filters,
  resultsClassName
}: DatasheetBrowserProps<T>) => {
  const { t } = useTranslation('catalog');
  const [selectedSupplement, setSelectedSupplement] = useState('all');
  const [selectedRole, setSelectedRole] = useState<RoleTab>('all');
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
  const searchedDatasheets = useMemo(() => {
    const matches = normalizedQuery
      ? filteredBySettings.filter((sheet) => sheet.name.toLowerCase().includes(normalizedQuery))
      : filteredBySettings;
    return sortDatasheetsBySupplementPreference(
      sortByName(matches),
      supplement.selected,
      supplement.hasSupplements
    );
  }, [filteredBySettings, normalizedQuery, supplement.selected, supplement.hasSupplements]);

  const renderItem: (datasheet: T) => ReactNode =
    renderDatasheet ??
    ((datasheet) => (
      <DatasheetListItemCard
        datasheet={datasheet}
        supplementMetadataHasSupplements={supplement.hasSupplements}
      />
    ));

  // Role pills only on the default card grid. Custom renderers (the add-units
  // picker) stay a flat list. Manifests generated before `role` existed report
  // everything as "other"; stay unfiltered rather than showing one meaningless pill.
  const roleTabs = useMemo(() => {
    if (renderDatasheet) return null;
    if (!searchedDatasheets.some((sheet) => getListItemRole(sheet) !== 'other')) return null;

    const counts = new Map<BattlefieldRole, number>();
    for (const sheet of searchedDatasheets) {
      const role = getListItemRole(sheet);
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }

    return [
      { value: 'all' as const, label: t('all'), count: searchedDatasheets.length },
      ...BATTLEFIELD_ROLES.filter((role) => (counts.get(role) ?? 0) > 0).map((role) => ({
        value: role,
        label: t(`roles.${role}`),
        count: counts.get(role)!
      }))
    ];
  }, [renderDatasheet, searchedDatasheets, t]);

  const visibleDatasheets = useMemo(() => {
    if (!roleTabs || selectedRole === 'all') return searchedDatasheets;
    return searchedDatasheets.filter((sheet) => getListItemRole(sheet) === selectedRole);
  }, [roleTabs, selectedRole, searchedDatasheets]);

  const emptyMessage = debouncedQuery
    ? t('noDatasheetsMatching')
    : (emptyStateMessage ?? t('noDatasheets'));

  const resultItems = visibleDatasheets.map((datasheet) => (
    <div key={datasheet.slug} id={datasheet.id}>
      {renderItem(datasheet)}
    </div>
  ));

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

        <Search
          label={t('searchDatasheets')}
          value={query}
          onChange={setQuery}
          placeholder={searchPlaceholder ?? t('searchDatasheetsPlaceholder')}
          testId="datasheet-search"
          className="w-full"
          clearable
          clearTestId="datasheet-search-clear"
        />
        {supplement.isFiltered && supplement.label ? (
          <span className="text-xs text-subtle" data-testid="supplement-summary">
            {t(supplement.selected === CODEX_SLUG ? 'coreSupplementSummary' : 'supplementSummary', {
              label: supplement.selected === CODEX_SLUG ? t('noSupplement') : supplement.label,
              count: supplement.filteredActive.length
            })}
            {supplement.sharedCount > 0
              ? t('sharedCoreCount', { count: supplement.sharedCount })
              : ''}
          </span>
        ) : null}
        {roleTabs ? (
          <PillTabs
            tabs={roleTabs}
            active={selectedRole}
            onChange={setSelectedRole}
            ariaLabel={t('rolesLabel')}
            testIdPrefix="datasheet-role"
          />
        ) : null}
        {showItemCount ? (
          <span className="text-sm text-subtle">
            {t('showingDatasheets', {
              visible: visibleDatasheets.length,
              count: filteredBySettings.length
            })}
            {supplement.isFiltered ? t('fromTotal', { count: datasheets.length }) : ''}
          </span>
        ) : null}
      </div>

      {visibleDatasheets.length > 0 ? (
        renderDatasheet ? (
          <div
            className={cx('flex flex-col gap-2', resultsClassName)}
            aria-live="polite"
            id="datasheet-results"
            data-testid="datasheet-results"
          >
            {resultItems}
          </div>
        ) : (
          <Grid
            data-testid="datasheet-results"
            id="datasheet-results"
            className={resultsClassName}
            aria-live="polite"
          >
            {resultItems}
          </Grid>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-subtle">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};
