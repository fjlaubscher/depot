import type { Datasheet, DatasheetSummary } from '../types/depot.js';
import { groupBy } from './common.js';

export type DatasheetListItem = Datasheet | DatasheetSummary;

export interface DatasheetVisibilityFilters {
  showLegends?: boolean;
  showForgeWorld?: boolean;
}

export interface SupplementOption {
  label: string;
  value: string;
  count: number;
}

export interface SupplementMetadata {
  hasSupplements: boolean;
  hasCodexDatasheets: boolean;
  options: SupplementOption[];
}

export const filterDatasheetsBySettings = <T extends DatasheetListItem>(
  datasheets: T[],
  filters?: DatasheetVisibilityFilters
): T[] =>
  filters
    ? datasheets.filter(
        (sheet) =>
          !(filters.showLegends === false && sheet.isLegends) &&
          !(filters.showForgeWorld === false && sheet.isForgeWorld)
      )
    : datasheets;

export const isCharacter = (datasheet: Pick<Datasheet, 'keywords'>): boolean =>
  datasheet.keywords.some((entry) => entry.keyword.toLowerCase().includes('character'));

export const CODEX_SLUG = 'codex';

export const toTitleCase = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const normalizeSupplementValue = (value: string | undefined | null) => {
  const normalized = (value ?? '').trim().toLowerCase();
  return normalized || CODEX_SLUG;
};

export const getSupplementKey = (sheet: DatasheetListItem) => sheet.supplementKey ?? CODEX_SLUG;

export const isSupplementEntry = (sheet: DatasheetListItem) => sheet.isSupplement === true;

export const buildSupplementLabel = (slug: string, name?: string) =>
  normalizeSupplementValue(slug) === CODEX_SLUG ? 'None' : (name ?? toTitleCase(slug));

export const deriveSupplementMetadata = (datasheets: DatasheetListItem[]): SupplementMetadata => {
  const hasSupplements = datasheets.some(isSupplementEntry);
  const hasCodexDatasheets = !datasheets.every(isSupplementEntry);
  if (!hasSupplements) {
    return { hasSupplements, hasCodexDatasheets, options: [] };
  }

  const bySupplement = groupBy(datasheets, getSupplementKey);
  const supplementEntries = [...bySupplement]
    .filter(([, sheets]) => sheets.some(isSupplementEntry))
    .map(([key, sheets]) => {
      const first = sheets.find(isSupplementEntry)!;
      return {
        value: key,
        label: first.supplementLabel ?? buildSupplementLabel(key, first.supplementName),
        count: sheets.length
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    hasSupplements,
    hasCodexDatasheets,
    options: [
      { label: 'All', value: 'all', count: datasheets.length },
      ...(hasCodexDatasheets
        ? [{ label: 'None', value: CODEX_SLUG, count: bySupplement.get(CODEX_SLUG)?.length ?? 0 }]
        : []),
      ...supplementEntries
    ]
  };
};

export const filterDatasheetsBySupplement = <T extends DatasheetListItem>(
  datasheets: T[],
  selectedSupplement: string
): T[] => {
  const normalizedSelection = normalizeSupplementValue(selectedSupplement || 'all');

  if (normalizedSelection === 'all') {
    return datasheets;
  }

  const matches = datasheets.filter((sheet) =>
    isSupplementEntry(sheet)
      ? getSupplementKey(sheet) === normalizedSelection
      : normalizedSelection === CODEX_SLUG
  );

  return normalizedSelection === CODEX_SLUG
    ? matches
    : matches.concat(datasheets.filter((sheet) => !isSupplementEntry(sheet)));
};

export const shouldResetSupplementSelection = (
  supplementaryDatasheets: DatasheetListItem[],
  filtersAppliedDatasheets: DatasheetListItem[]
) => supplementaryDatasheets.length > 0 && filtersAppliedDatasheets.length === 0;

export const sortDatasheetsBySupplementPreference = <T extends DatasheetListItem>(
  datasheets: T[],
  normalizedSelectedSupplement: string,
  hasSupplements: boolean
): T[] => {
  if (!hasSupplements || normalizedSelectedSupplement === 'all') {
    return datasheets;
  }

  const getPriority = (sheet: T) => {
    const key = getSupplementKey(sheet);
    const isSupplement = isSupplementEntry(sheet);
    const effectiveKey = key || CODEX_SLUG;

    if (normalizedSelectedSupplement === CODEX_SLUG) {
      return isSupplement ? 1 : 0;
    }

    return effectiveKey === normalizedSelectedSupplement ? 0 : 1;
  };

  return datasheets.slice().sort((a, b) => {
    const priorityDiff = getPriority(a) - getPriority(b);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return a.name.localeCompare(b.name);
  });
};
