import { describe, it, expect } from 'vitest';
import {
  filterFactionsByQuery,
  groupFactionsByAlliance,
  createTabLabels,
  hasMyFactions
} from './faction';
import { depot } from "@depot/core";

// Mock data for testing
const mockFactions: depot.Index[] = [
  { id: 'SM', name: 'Space Marines', path: '/data/sm.json' },
  { id: 'CSM', name: 'Chaos Space Marines', path: '/data/csm.json' },
  { id: 'ORK', name: 'Orks', path: '/data/orks.json' },
  { id: 'TAU', name: "T'au Empire", path: '/data/tau.json' },
  { id: 'AM', name: 'Astra Militarum', path: '/data/am.json' }
];

describe('faction utilities', () => {
  describe('filterFactionsByQuery', () => {
    it('should return empty array when factions is null', () => {
      const result = filterFactionsByQuery(null, 'space');
      expect(result).toEqual([]);
    });

    it('should return all factions when query is empty', () => {
      const result = filterFactionsByQuery(mockFactions, '');
      expect(result).toEqual(mockFactions);
    });

    it('should filter factions by name (case insensitive)', () => {
      const result = filterFactionsByQuery(mockFactions, 'space');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Space Marines');
      expect(result[1].name).toBe('Chaos Space Marines');
    });

    it('should filter factions with partial matches', () => {
      const result = filterFactionsByQuery(mockFactions, 'mar');
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(expect.objectContaining({ name: 'Space Marines' }));
      expect(result).toContainEqual(expect.objectContaining({ name: 'Chaos Space Marines' }));
    });

    it('should return empty array when no matches found', () => {
      const result = filterFactionsByQuery(mockFactions, 'necrons');
      expect(result).toEqual([]);
    });

    it('should handle special characters in query', () => {
      const result = filterFactionsByQuery(mockFactions, "t'au");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("T'au Empire");
    });
  });

  describe('groupFactionsByAlliance', () => {
    it('should group factions by their alliance', () => {
      const result = groupFactionsByAlliance(mockFactions);

      expect(result).toHaveProperty('imperium');
      expect(result).toHaveProperty('chaos');
      expect(result).toHaveProperty('xenos');

      expect(result.imperium).toHaveLength(2);
      expect(result.chaos).toHaveLength(1);
      expect(result.xenos).toHaveLength(2);
    });

    it('should sort factions alphabetically within each alliance', () => {
      const result = groupFactionsByAlliance(mockFactions);

      // Check if Imperium factions are sorted alphabetically
      expect(result.imperium[0].name).toBe('Astra Militarum');
      expect(result.imperium[1].name).toBe('Space Marines');

      // Check if Xenos factions are sorted alphabetically
      expect(result.xenos[0].name).toBe('Orks');
      expect(result.xenos[1].name).toBe("T'au Empire");
    });

    it('should handle empty array', () => {
      const result = groupFactionsByAlliance([]);
      expect(result).toEqual({});
    });

    it('should handle factions with unrecognized IDs', () => {
      const unknownFaction: depot.Index = {
        id: 'UNKNOWN',
        name: 'Unknown Faction',
        path: '/data/unknown.json'
      };

      const result = groupFactionsByAlliance([unknownFaction]);
      expect(result).toHaveProperty('unaligned');
      expect(result.unaligned).toHaveLength(1);
      expect(result.unaligned[0].name).toBe('Unknown Faction');
    });
  });

  describe('createTabLabels', () => {
    it('should include My Factions when user has factions', () => {
      const result = createTabLabels(true);
      expect(result).toEqual(['My Factions', 'All Factions']);
    });

    it('should only show All Factions when user has no factions', () => {
      const result = createTabLabels(false);
      expect(result).toEqual(['All Factions']);
    });
  });

  describe('hasMyFactions', () => {
    it('should return true when factions array has items', () => {
      const result = hasMyFactions([mockFactions[0]]);
      expect(result).toBe(true);
    });

    it('should return false when factions array is empty', () => {
      const result = hasMyFactions([]);
      expect(result).toBe(false);
    });

    it('should return false when factions is undefined', () => {
      const result = hasMyFactions(undefined);
      expect(result).toBe(false);
    });

    it('should return false when factions is null', () => {
      const result = hasMyFactions(null as any);
      expect(result).toBe(false);
    });
  });
});
