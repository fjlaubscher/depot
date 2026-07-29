import type { Enhancement, Keyword } from '../types/depot.js';
import { slugify } from './slug.js';

export const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export const groupBy = <T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {};
  items.forEach((item) => {
    (grouped[keyFn(item)] ??= []).push(item);
  });
  return grouped;
};

export const safeSlug = (value: string): string => slugify(value).replace(/-/g, '_') || 'item';

export interface GroupedKeywords {
  datasheet: string[];
  faction: string[];
}

export const groupKeywords = (keywords: Keyword[]): GroupedKeywords => {
  const named = keywords.filter((keyword) => keyword.keyword);
  return {
    datasheet: named
      .filter((keyword) => keyword.isFactionKeyword !== 'true')
      .map((keyword) => keyword.keyword)
      .sort(),
    faction: named
      .filter((keyword) => keyword.isFactionKeyword === 'true')
      .map((keyword) => keyword.keyword)
      .sort()
  };
};

export const getFactionAlliance = (factionId: string) => {
  switch (factionId) {
    case 'AoI':
    case 'AC':
    case 'AM':
    case 'AS':
    case 'AdM':
    case 'GK':
    case 'QI':
    case 'SM':
    case 'TL':
      return 'Imperium';
    case 'CD':
    case 'CSM':
    case 'DG':
    case 'EC':
    case 'QT':
    case 'TS':
    case 'WE':
      return 'Chaos';
    case 'AE':
    case 'DRU':
    case 'GC':
    case 'LoV':
    case 'NEC':
    case 'ORK':
    case 'TAU':
    case 'TYR':
      return 'Xenos';
    default:
      return 'Unaligned';
  }
};

export const groupEnhancementsByDetachment = (
  enhancements: Enhancement[]
): Record<string, Enhancement[]> => {
  const grouped = groupBy(enhancements, (enhancement) => enhancement.detachment || 'General');
  Object.keys(grouped).forEach((key) => {
    grouped[key] = sortByName(grouped[key]);
  });
  return grouped;
};

export const filterEnhancements = (
  enhancements: Enhancement[],
  query: string,
  detachment?: string
): Enhancement[] => {
  let filtered = detachment
    ? enhancements.filter((enhancement) => enhancement.detachment === detachment)
    : enhancements;

  if (query) {
    const normalizedQuery = query.toLowerCase();
    filtered = filtered.filter((enhancement) =>
      enhancement.name.toLowerCase().includes(normalizedQuery)
    );
  }

  return filtered;
};

export const getUniqueEnhancementDetachmentTypes = (enhancements: Enhancement[]): string[] =>
  [
    ...new Set(
      enhancements
        .map((enhancement) => enhancement.detachment)
        .filter((detachment): detachment is string => Boolean(detachment))
    )
  ].sort();

export const isEnhancementGroupedDataEmpty = (grouped: Record<string, Enhancement[]>): boolean =>
  Object.values(grouped).every((enhancements) => !enhancements.length);

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const label = segment.replace(/-/g, ' ');
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      path: `/${segments.slice(0, index + 1).join('/')}`
    };
  });
};
