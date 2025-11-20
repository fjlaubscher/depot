import type { DatasheetListItem } from '@/types/datasheets';

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

export const CODEX_SLUG = 'codex';

export const toTitleCase = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const normalizeSupplementValue = (value: string) => value.toLowerCase();

export const isCodexEntry = (slug?: string) => {
  if (!slug) {
    return true;
  }

  return normalizeSupplementValue(slug) === CODEX_SLUG;
};

export const buildSupplementLabel = (slug: string, name?: string) => {
  const normalizedSlug = normalizeSupplementValue(slug);

  if (normalizedSlug === CODEX_SLUG) {
    return 'None';
  }

  return name ?? toTitleCase(slug);
};

export const deriveSupplementMetadata = (datasheets: DatasheetListItem[]): SupplementMetadata => {
  const hasSupplements = datasheets.some((sheet) => Boolean(sheet.supplementSlug));
  const hasCodexDatasheets = datasheets.some((sheet) => isCodexEntry(sheet.supplementSlug));
  const supplementCounts = new Map<string, number>();

  datasheets.forEach((sheet) => {
    const slug = normalizeSupplementValue(sheet.supplementSlug ?? CODEX_SLUG);
    supplementCounts.set(slug, (supplementCounts.get(slug) ?? 0) + 1);
  });

  if (!hasSupplements) {
    return {
      hasSupplements: false,
      hasCodexDatasheets,
      options: []
    };
  }

  const uniqueSupplements = new Map<string, string | undefined>();

  datasheets.forEach((sheet) => {
    if (!sheet.supplementSlug || uniqueSupplements.has(sheet.supplementSlug)) {
      return;
    }

    uniqueSupplements.set(sheet.supplementSlug, sheet.supplementName);
  });

  const supplementEntries = Array.from(uniqueSupplements.entries())
    .filter(([slug]) => normalizeSupplementValue(slug) !== CODEX_SLUG)
    .map(([slug, name]) => ({
      value: slug,
      label: buildSupplementLabel(slug, name),
      count: supplementCounts.get(normalizeSupplementValue(slug)) ?? 0
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const options: SupplementOption[] = [
    { label: 'All', value: 'all', count: datasheets.length },
    ...(hasCodexDatasheets
      ? [{ label: 'None', value: CODEX_SLUG, count: supplementCounts.get(CODEX_SLUG) ?? 0 }]
      : []),
    ...supplementEntries
  ];

  return {
    hasSupplements: true,
    hasCodexDatasheets,
    options
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

  const codexDatasheets: T[] = [];
  const supplementDatasheets: T[] = [];

  datasheets.forEach((sheet) => {
    const slug = sheet.supplementSlug;
    const isCodex = isCodexEntry(slug);

    if (isCodex) {
      if (normalizedSelection === CODEX_SLUG) {
        supplementDatasheets.push(sheet);
      } else {
        codexDatasheets.push(sheet);
      }
      return;
    }

    if (!slug) {
      return;
    }

    if (normalizeSupplementValue(slug) === normalizedSelection) {
      supplementDatasheets.push(sheet);
    }
  });

  if (normalizedSelection === CODEX_SLUG) {
    return supplementDatasheets;
  }

  return [...supplementDatasheets, ...codexDatasheets];
};

export const shouldResetSupplementSelection = (
  supplementaryDatasheets: DatasheetListItem[],
  filtersAppliedDatasheets: DatasheetListItem[]
) => supplementaryDatasheets.length > 0 && filtersAppliedDatasheets.length === 0;
