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
