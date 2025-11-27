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

export const getSupplementKey = (sheet: DatasheetListItem) =>
  sheet.supplementKey ?? normalizeSupplementValue(sheet.supplementSlug ?? CODEX_SLUG);

export const isSupplementEntry = (sheet: DatasheetListItem) => {
  if (typeof sheet.isSupplement === 'boolean') {
    return sheet.isSupplement;
  }

  const key = getSupplementKey(sheet);
  return key !== CODEX_SLUG;
};

export const isCodexEntry = (slug?: string, isSupplement?: boolean) => {
  if (typeof isSupplement === 'boolean') {
    return !isSupplement;
  }

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
  const hasSupplements = datasheets.some((sheet) => isSupplementEntry(sheet));
  const hasCodexDatasheets = datasheets.some((sheet) => !isSupplementEntry(sheet));
  const supplementCounts = new Map<string, number>();

  datasheets.forEach((sheet) => {
    const key = getSupplementKey(sheet);
    supplementCounts.set(key, (supplementCounts.get(key) ?? 0) + 1);
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
    if (!isSupplementEntry(sheet)) {
      return;
    }

    const key = getSupplementKey(sheet);
    if (uniqueSupplements.has(key)) {
      return;
    }

    const label = sheet.supplementLabel ?? buildSupplementLabel(key, sheet.supplementName);
    uniqueSupplements.set(key, label);
  });

  const supplementEntries = Array.from(uniqueSupplements.entries())
    .map(([key, label]) => ({
      value: key,
      label: label ?? toTitleCase(key),
      count: supplementCounts.get(key) ?? 0
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
    const key = getSupplementKey(sheet);
    const isSupplement = isSupplementEntry(sheet);
    const isCodex = !isSupplement;

    if (isCodex) {
      if (normalizedSelection === CODEX_SLUG) {
        supplementDatasheets.push(sheet);
      } else {
        codexDatasheets.push(sheet);
      }
      return;
    }

    if (key === normalizedSelection) {
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

export const formatDetachmentSupplementLabel = (
  supplementKey?: string | null,
  supplementLabel?: string | null
): string | null => {
  if (!supplementKey && !supplementLabel) {
    return null;
  }

  if (supplementLabel && supplementLabel !== 'None') {
    return supplementLabel;
  }

  if (supplementKey && normalizeSupplementValue(supplementKey) !== CODEX_SLUG) {
    return toTitleCase(supplementKey);
  }

  return 'Codex';
};

export const formatDetachmentOptionLabel = (
  name: string,
  supplementKey?: string | null,
  supplementLabel?: string | null
): string => {
  const formatted = formatDetachmentSupplementLabel(supplementKey, supplementLabel);
  if (!formatted) {
    return name;
  }

  return `${name} [${formatted}]`;
};

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
