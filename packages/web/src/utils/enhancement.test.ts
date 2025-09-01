import { describe, it, expect } from 'vitest';
import { depot } from "@depot/core";
import {
  groupEnhancementsByDetachment,
  filterEnhancements,
  getUniqueEnhancementDetachmentTypes,
  isEnhancementGroupedDataEmpty
} from './enhancement';

// Mock data
const mockEnhancements: depot.Enhancement[] = [
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
    detachment: '' // Empty detachment should go to 'General'
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

describe('enhancement utilities', () => {
  describe('groupEnhancementsByDetachment', () => {
    it('groups enhancements by detachment', () => {
      const result = groupEnhancementsByDetachment(mockEnhancements);

      expect(result['Gladius Strike Force']).toHaveLength(2);
      expect(result['Firestorm Assault Force']).toHaveLength(1);
      expect(result['General']).toHaveLength(1);
    });

    it('sorts enhancements within each detachment by name', () => {
      const result = groupEnhancementsByDetachment(mockEnhancements);

      expect(result['Gladius Strike Force'][0].name).toBe('Adamantine Mantle');
      expect(result['Gladius Strike Force'][1].name).toBe('The Honour Vehement');
    });

    it('handles empty detachment as "General"', () => {
      const result = groupEnhancementsByDetachment(mockEnhancements);

      expect(result['General']).toHaveLength(1);
      expect(result['General'][0].name).toBe('Artificer Armour');
    });

    it('handles empty array', () => {
      const result = groupEnhancementsByDetachment([]);

      expect(result).toEqual({});
    });
  });

  describe('filterEnhancements', () => {
    it('filters by query', () => {
      const result = filterEnhancements(mockEnhancements, 'honour', undefined);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('The Honour Vehement');
    });

    it('filters by detachment', () => {
      const result = filterEnhancements(mockEnhancements, '', 'Gladius Strike Force');

      expect(result).toHaveLength(2);
      expect(result.every((enhancement) => enhancement.detachment === 'Gladius Strike Force')).toBe(
        true
      );
    });

    it('filters by both query and detachment', () => {
      const result = filterEnhancements(mockEnhancements, 'mantle', 'Gladius Strike Force');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Adamantine Mantle');
    });

    it('is case insensitive for query', () => {
      const result = filterEnhancements(mockEnhancements, 'HONOUR', undefined);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('The Honour Vehement');
    });

    it('returns all enhancements when no filters applied', () => {
      const result = filterEnhancements(mockEnhancements, '', undefined);

      expect(result).toHaveLength(4);
    });

    it('handles empty array', () => {
      const result = filterEnhancements([], 'test', undefined);

      expect(result).toEqual([]);
    });
  });

  describe('getUniqueEnhancementDetachmentTypes', () => {
    it('returns unique detachment types sorted', () => {
      const result = getUniqueEnhancementDetachmentTypes(mockEnhancements);

      expect(result).toEqual(['Firestorm Assault Force', 'Gladius Strike Force']);
    });

    it('filters out empty detachment values', () => {
      const result = getUniqueEnhancementDetachmentTypes(mockEnhancements);

      expect(result).not.toContain('');
    });

    it('handles empty array', () => {
      const result = getUniqueEnhancementDetachmentTypes([]);

      expect(result).toEqual([]);
    });

    it('handles duplicate detachment types', () => {
      const duplicateEnhancements = [
        ...mockEnhancements,
        {
          id: '5',
          factionId: 'SM',
          name: 'Another Gladius Enhancement',
          legend: 'Test',
          description: 'Test enhancement',
          cost: '30',
          detachment: 'Gladius Strike Force'
        }
      ];

      const result = getUniqueEnhancementDetachmentTypes(duplicateEnhancements);

      expect(result).toEqual(['Firestorm Assault Force', 'Gladius Strike Force']);
    });
  });

  describe('isEnhancementGroupedDataEmpty', () => {
    it('returns true when all groups are empty', () => {
      const emptyGroups = {
        'Group 1': [],
        'Group 2': [],
        'Group 3': []
      };

      expect(isEnhancementGroupedDataEmpty(emptyGroups)).toBe(true);
    });

    it('returns false when at least one group has data', () => {
      const mixedGroups = {
        'Group 1': [],
        'Group 2': [mockEnhancements[0]],
        'Group 3': []
      };

      expect(isEnhancementGroupedDataEmpty(mixedGroups)).toBe(false);
    });

    it('returns true for empty object', () => {
      expect(isEnhancementGroupedDataEmpty({})).toBe(true);
    });

    it('returns false when all groups have data', () => {
      const fullGroups = {
        'Group 1': [mockEnhancements[0]],
        'Group 2': [mockEnhancements[1]]
      };

      expect(isEnhancementGroupedDataEmpty(fullGroups)).toBe(false);
    });
  });
});
