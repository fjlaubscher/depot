import { describe, it, expect } from 'vitest';
import type { Keyword } from '../types/depot.js';
import {
  sortByName,
  safeSlug,
  groupKeywords,
  getFactionAlliance,
  generateBreadcrumbs
} from './common.js';

describe('common utilities', () => {
  describe('sortByName', () => {
    it('sorts items alphabetically ignoring case', () => {
      const result = sortByName([{ name: 'beta' }, { name: 'Alpha' }, { name: 'gamma' }]);
      expect(result.map((item) => item.name)).toEqual(['Alpha', 'beta', 'gamma']);
    });
  });

  describe('safeSlug', () => {
    it('normalizes arbitrary text into a slug', () => {
      expect(safeSlug('My Roster 123')).toBe('my_roster_123');
      expect(safeSlug('_hello_world_')).toBe('hello_world');
      expect(safeSlug('!!!')).toBe('item');
    });
  });

  describe('groupKeywords', () => {
    it('separates faction keywords from datasheet keywords', () => {
      const keywords: Keyword[] = [
        { keyword: 'Adeptus Astartes', isFactionKeyword: 'true' },
        { keyword: 'Captain', isFactionKeyword: 'false' },
        { keyword: '', isFactionKeyword: 'false' }
      ];
      const grouped = groupKeywords(keywords);
      expect(grouped.faction).toEqual(['Adeptus Astartes']);
      expect(grouped.datasheet).toEqual(['Captain']);
    });
  });

  describe('getFactionAlliance', () => {
    it('returns alliance labels for known factions', () => {
      expect(getFactionAlliance('SM')).toBe('Imperium');
      expect(getFactionAlliance('CSM')).toBe('Chaos');
      expect(getFactionAlliance('ORK')).toBe('Xenos');
      expect(getFactionAlliance('UNKNOWN')).toBe('Unaligned');
    });
  });

  describe('generateBreadcrumbs', () => {
    it('builds breadcrumb entries from pathname segments', () => {
      const breadcrumbs = generateBreadcrumbs('/faction/space-marines/datasheet');
      expect(breadcrumbs).toEqual([
        { label: 'Faction', path: '/faction' },
        { label: 'Space marines', path: '/faction/space-marines' },
        { label: 'Datasheet', path: '/faction/space-marines/datasheet' }
      ]);
    });
  });
});
