import type { Keyword } from '../types/depot.js';
import { slugify } from './slug.js';

export const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

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

const ALLIANCES: Record<string, string[]> = {
  Imperium: ['AoI', 'AC', 'AM', 'AS', 'AdM', 'GK', 'QI', 'SM', 'TL'],
  Chaos: ['CD', 'CSM', 'DG', 'EC', 'QT', 'TS', 'WE'],
  Xenos: ['AE', 'DRU', 'GC', 'LoV', 'NEC', 'ORK', 'TAU', 'TYR']
};

export const getFactionAlliance = (factionId: string) =>
  Object.entries(ALLIANCES).find(([, ids]) => ids.includes(factionId))?.[0] ?? 'Unaligned';

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

/**
 * `Map.groupBy` without the Baseline 2024-03 requirement — bundlers transpile syntax, never
 * built-in methods, and this ships to an offline PWA that still runs on iOS 17.0-17.3.
 */
export const groupBy = <T, K>(items: Iterable<T>, key: (item: T) => K): Map<K, T[]> => {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const group = groups.get(k);
    if (group) {
      group.push(item);
    } else {
      groups.set(k, [item]);
    }
  }
  return groups;
};
