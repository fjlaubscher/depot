import { describe, it, expect } from 'vitest';
import { depot } from 'depot-core';
import {
  groupDetachmentAbilitiesByDetachment,
  filterDetachmentAbilities,
  getUniqueDetachmentTypes,
  isGroupedDataEmpty
} from './detachment';

// Mock data
const mockDetachmentAbilities: depot.DetachmentAbility[] = [
  {
    id: '1',
    factionId: 'SM',
    name: 'Combat Doctrines',
    legend: 'Space Marines Rule',
    description: 'Space Marines doctrine ability',
    detachment: 'Gladius Strike Force'
  },
  {
    id: '2',
    factionId: 'SM',
    name: 'Oath of Moment',
    legend: 'Tactical Rule',
    description: 'Oath of moment ability',
    detachment: 'Gladius Strike Force'
  },
  {
    id: '3',
    factionId: 'SM',
    name: 'Angels of Death',
    legend: 'General Rule',
    description: 'General Space Marines ability',
    detachment: '' // Empty detachment should go to 'General'
  },
  {
    id: '4',
    factionId: 'SM',
    name: 'Firestorm Assault Force',
    legend: 'Detachment Rule',
    description: 'Firestorm ability',
    detachment: 'Firestorm Assault Force'
  }
];

describe('detachment utilities', () => {
  describe('groupDetachmentAbilitiesByDetachment', () => {
    it('groups abilities by detachment', () => {
      const result = groupDetachmentAbilitiesByDetachment(mockDetachmentAbilities);

      expect(result['Gladius Strike Force']).toHaveLength(2);
      expect(result['Firestorm Assault Force']).toHaveLength(1);
      expect(result['General']).toHaveLength(1);
    });

    it('sorts abilities within each detachment by name', () => {
      const result = groupDetachmentAbilitiesByDetachment(mockDetachmentAbilities);

      expect(result['Gladius Strike Force'][0].name).toBe('Combat Doctrines');
      expect(result['Gladius Strike Force'][1].name).toBe('Oath of Moment');
    });

    it('handles empty detachment as "General"', () => {
      const result = groupDetachmentAbilitiesByDetachment(mockDetachmentAbilities);

      expect(result['General']).toHaveLength(1);
      expect(result['General'][0].name).toBe('Angels of Death');
    });

    it('handles empty array', () => {
      const result = groupDetachmentAbilitiesByDetachment([]);

      expect(result).toEqual({});
    });
  });

  describe('filterDetachmentAbilities', () => {
    it('filters by query', () => {
      const result = filterDetachmentAbilities(mockDetachmentAbilities, 'combat', undefined);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Combat Doctrines');
    });

    it('filters by detachment', () => {
      const result = filterDetachmentAbilities(mockDetachmentAbilities, '', 'Gladius Strike Force');

      expect(result).toHaveLength(2);
      expect(result.every((ability) => ability.detachment === 'Gladius Strike Force')).toBe(true);
    });

    it('filters by both query and detachment', () => {
      const result = filterDetachmentAbilities(
        mockDetachmentAbilities,
        'oath',
        'Gladius Strike Force'
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Oath of Moment');
    });

    it('is case insensitive for query', () => {
      const result = filterDetachmentAbilities(mockDetachmentAbilities, 'COMBAT', undefined);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Combat Doctrines');
    });

    it('returns all abilities when no filters applied', () => {
      const result = filterDetachmentAbilities(mockDetachmentAbilities, '', undefined);

      expect(result).toHaveLength(4);
    });

    it('handles empty array', () => {
      const result = filterDetachmentAbilities([], 'test', undefined);

      expect(result).toEqual([]);
    });
  });

  describe('getUniqueDetachmentTypes', () => {
    it('returns unique detachment types sorted', () => {
      const result = getUniqueDetachmentTypes(mockDetachmentAbilities);

      expect(result).toEqual(['Firestorm Assault Force', 'Gladius Strike Force']);
    });

    it('filters out empty detachment values', () => {
      const result = getUniqueDetachmentTypes(mockDetachmentAbilities);

      expect(result).not.toContain('');
    });

    it('handles empty array', () => {
      const result = getUniqueDetachmentTypes([]);

      expect(result).toEqual([]);
    });

    it('handles duplicate detachment types', () => {
      const duplicateAbilities = [
        ...mockDetachmentAbilities,
        {
          id: '5',
          factionId: 'SM',
          name: 'Another Gladius Ability',
          legend: 'Test',
          description: 'Test ability',
          detachment: 'Gladius Strike Force'
        }
      ];

      const result = getUniqueDetachmentTypes(duplicateAbilities);

      expect(result).toEqual(['Firestorm Assault Force', 'Gladius Strike Force']);
    });
  });

  describe('isGroupedDataEmpty', () => {
    it('returns true when all groups are empty', () => {
      const emptyGroups = {
        'Group 1': [],
        'Group 2': [],
        'Group 3': []
      };

      expect(isGroupedDataEmpty(emptyGroups)).toBe(true);
    });

    it('returns false when at least one group has data', () => {
      const mixedGroups = {
        'Group 1': [],
        'Group 2': [mockDetachmentAbilities[0]],
        'Group 3': []
      };

      expect(isGroupedDataEmpty(mixedGroups)).toBe(false);
    });

    it('returns true for empty object', () => {
      expect(isGroupedDataEmpty({})).toBe(true);
    });

    it('returns false when all groups have data', () => {
      const fullGroups = {
        'Group 1': [mockDetachmentAbilities[0]],
        'Group 2': [mockDetachmentAbilities[1]]
      };

      expect(isGroupedDataEmpty(fullGroups)).toBe(false);
    });
  });
});
