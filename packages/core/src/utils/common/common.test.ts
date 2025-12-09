import { describe, it, expect } from 'vitest';
import type { Enhancement, Keyword } from '../../types/depot.js';
import {
  sortByName,
  safeSlug,
  groupKeywords,
  getFactionAlliance,
  groupEnhancementsByDetachment,
  filterEnhancements,
  getUniqueEnhancementDetachmentTypes,
  isEnhancementGroupedDataEmpty,
  generateBreadcrumbs
} from './index.js';

describe('common utilities', () => {
  describe('sortByName', () => {
    it('sorts items alphabetically ignoring case', () => {
      const result = sortByName([{ name: 'beta' }, { name: 'Alpha' }, { name: 'gamma' }]);
      expect(result.map((item) => item.name)).toEqual(['Alpha', 'beta', 'gamma']);
    });

    it('filters falsy entries before sorting', () => {
      const result = sortByName([{ name: 'Bravo' }, null as unknown as { name: string }]);
      expect(result).toHaveLength(1);
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

  describe('enhancement helpers', () => {
    const mockEnhancements: Enhancement[] = [
      {
        id: '1',
        factionId: 'SM',
        name: 'The Honour Vehement',
        legend: 'Captain Enhancement',
        description: 'Boost Captain abilities',
        cost: '15',
        detachment: 'Gladius Strike Force'
      },
      {
        id: '2',
        factionId: 'SM',
        name: 'Adamantine Mantle',
        legend: 'Defensive Enhancement',
        description: 'Improves armor saves',
        cost: '20',
        detachment: 'Gladius Strike Force'
      },
      {
        id: '3',
        factionId: 'SM',
        name: 'Artificer Armour',
        legend: 'General Enhancement',
        description: 'General protection enhancement',
        cost: '10',
        detachment: ''
      },
      {
        id: '4',
        factionId: 'SM',
        name: 'Fiery Resolve',
        legend: 'Assault Enhancement',
        description: 'Firestorm enhancement',
        cost: '25',
        detachment: 'Firestorm Assault Force'
      }
    ];

    it('groups enhancements by detachment and sorts within each group', () => {
      const grouped = groupEnhancementsByDetachment(mockEnhancements);

      expect(Object.keys(grouped)).toContain('General');
      expect(grouped['Gladius Strike Force'][0].name).toBe('Adamantine Mantle');
      expect(grouped['General']).toHaveLength(1);
    });

    it('filters enhancements by query and detachment', () => {
      const filtered = filterEnhancements(mockEnhancements, 'mantle', 'Gladius Strike Force');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Adamantine Mantle');
    });

    it('returns sorted unique detachment names', () => {
      const types = getUniqueEnhancementDetachmentTypes(mockEnhancements);
      expect(types).toEqual(['Firestorm Assault Force', 'Gladius Strike Force']);
    });

    it('flags grouped data emptiness', () => {
      expect(
        isEnhancementGroupedDataEmpty({
          'Group 1': [],
          'Group 2': []
        })
      ).toBe(true);

      expect(
        isEnhancementGroupedDataEmpty({
          'Group 1': [],
          'Group 2': [mockEnhancements[0]]
        })
      ).toBe(false);
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
