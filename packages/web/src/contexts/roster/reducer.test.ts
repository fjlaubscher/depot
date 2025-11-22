import { describe, it, expect } from 'vitest';
import { rosterReducer } from './reducer';
import { initialState } from './constants';
import type { RosterAction } from './types';
import type { depot } from '@depot/core';
import {
  mockFactionIndex,
  mockRosterUnit,
  mockEnhancement,
  createMockDatasheet,
  createMockRoster
} from '@/test/mock-data';

const mockWargearAbility: depot.Ability = {
  id: 'wg-1',
  name: 'Relic Blade',
  legend: '',
  factionId: 'SM',
  description: 'When equipped, improves weapon damage.',
  type: 'Wargear'
};

describe('rosterReducer', () => {
  it('should return initial state for unknown action', () => {
    const result = rosterReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
    expect(result).toBe(initialState);
  });

  describe('SET_ROSTER', () => {
    it('should set the entire roster state', () => {
      const rosterUnit: depot.RosterUnit = {
        ...mockRosterUnit,
        modelCost: {
          ...mockRosterUnit.modelCost,
          cost: '500'
        }
      };

      const mockRoster: depot.Roster = {
        id: 'test-id',
        name: 'Test Roster',
        factionId: 'SM',
        factionSlug: 'space-marines',
        faction: mockFactionIndex,
        detachment: {
          slug: 'test-detachment',
          name: 'Test Detachment',
          abilities: [],
          enhancements: [],
          stratagems: []
        },
        points: {
          current: 500,
          max: 2000
        },
        warlordUnitId: null,
        units: [rosterUnit],
        enhancements: []
      };

      const action: RosterAction = {
        type: 'SET_ROSTER',
        payload: mockRoster
      };

      const result = rosterReducer(initialState, action);
      expect(result).toEqual(mockRoster);
      expect(result).not.toBe(initialState); // Ensure immutability
    });

    it('should recalculate points when persisted total is stale', () => {
      const rosterUnit: depot.RosterUnit = {
        ...mockRosterUnit,
        modelCost: {
          ...mockRosterUnit.modelCost,
          cost: '80'
        }
      };

      const action: RosterAction = {
        type: 'SET_ROSTER',
        payload: {
          ...initialState,
          points: {
            current: 999,
            max: 2000
          },
          units: [rosterUnit],
          enhancements: [
            {
              enhancement: mockEnhancement,
              unitId: rosterUnit.id
            }
          ]
        }
      };

      const result = rosterReducer(initialState, action);

      // 80 (unit cost) + 10 (enhancement cost)
      expect(result.points.current).toBe(90);
      expect(result.points.max).toBe(2000);
    });

    it('normalizes wargear abilities against the datasheet', () => {
      const datasheetWithWargearAbility = createMockDatasheet({
        abilities: [...createMockDatasheet().abilities, mockWargearAbility]
      });

      const rosterUnit: depot.RosterUnit = {
        ...mockRosterUnit,
        datasheet: datasheetWithWargearAbility,
        selectedWargearAbilities: [
          mockWargearAbility,
          { ...mockWargearAbility, id: 'missing-ability' }
        ]
      };

      const action: RosterAction = {
        type: 'SET_ROSTER',
        payload: {
          ...initialState,
          units: [rosterUnit],
          enhancements: []
        }
      };

      const result = rosterReducer(initialState, action);

      expect(result.units[0].selectedWargearAbilities).toEqual([mockWargearAbility]);
    });
  });

  describe('CREATE_ROSTER', () => {
    it('should create a new roster with provided data', () => {
      const mockDetachment: depot.Detachment = {
        slug: 'test-detachment',
        name: 'Test Detachment',
        abilities: [],
        enhancements: [],
        stratagems: []
      };

      const action: RosterAction = {
        type: 'CREATE_ROSTER',
        payload: {
          id: 'new-roster-id',
          name: 'New Roster',
          factionId: 'CHAOS',
          factionSlug: 'chaos-space-marines',
          faction: {
            ...mockFactionIndex,
            id: 'CHAOS',
            slug: 'chaos-space-marines',
            name: 'Chaos Space Marines'
          },
          maxPoints: 1500,
          detachment: mockDetachment
        }
      };

      const result = rosterReducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        id: 'new-roster-id',
        name: 'New Roster',
        factionId: 'CHAOS',
        factionSlug: 'chaos-space-marines',
        faction: {
          ...mockFactionIndex,
          id: 'CHAOS',
          slug: 'chaos-space-marines',
          name: 'Chaos Space Marines'
        },
        detachment: mockDetachment,
        points: {
          current: 0,
          max: 1500
        }
      });
      expect(result).not.toBe(initialState); // Ensure immutability
    });

    it('should preserve initial detachment structure', () => {
      const mockDetachment: depot.Detachment = {
        slug: 'combat-patrol',
        name: 'Combat Patrol',
        abilities: [],
        enhancements: [],
        stratagems: []
      };

      const action: RosterAction = {
        type: 'CREATE_ROSTER',
        payload: {
          id: 'roster-id',
          name: 'Test',
          factionId: 'SM',
          factionSlug: 'space-marines',
          faction: mockFactionIndex,
          maxPoints: 2000,
          detachment: mockDetachment
        }
      };

      const result = rosterReducer(initialState, action);

      expect(result.detachment).toEqual(mockDetachment);
    });
  });

  describe('UPDATE_UNIT_WARGEAR_ABILITIES', () => {
    it('updates selected wargear abilities for a unit', () => {
      const roster = createMockRoster({
        units: [{ ...mockRosterUnit, selectedWargearAbilities: [] }]
      });

      const action: RosterAction = {
        type: 'UPDATE_UNIT_WARGEAR_ABILITIES',
        payload: {
          rosterUnitId: mockRosterUnit.id,
          abilities: [mockWargearAbility]
        }
      };

      const result = rosterReducer(roster, action);

      expect(result.units[0].selectedWargearAbilities).toEqual([mockWargearAbility]);
    });
  });

  describe('UPDATE_DETAILS', () => {
    it('should update roster metadata and recalculate totals', () => {
      const startingState = createMockRoster({
        points: { current: 999, max: 2000 }
      });

      const updatedDetachment: depot.Detachment = {
        slug: 'ironstorm-spearhead',
        name: 'Ironstorm Spearhead',
        abilities: [],
        enhancements: [],
        stratagems: []
      };

      const action: RosterAction = {
        type: 'UPDATE_DETAILS',
        payload: {
          name: 'Updated Roster',
          detachment: updatedDetachment,
          maxPoints: 1500
        }
      };

      const result = rosterReducer(startingState, action);

      expect(result.name).toBe('Updated Roster');
      expect(result.detachment).toEqual(updatedDetachment);
      expect(result.points.max).toBe(1500);
      expect(result.points.current).toBe(80);
    });
  });

  describe('SET_DETACHMENT', () => {
    it('should update the detachment', () => {
      const currentState: depot.Roster = {
        ...initialState,
        id: 'test-id',
        name: 'Test Roster',
        factionId: 'SM',
        factionSlug: 'space-marines',
        faction: mockFactionIndex
      };

      const mockDetachment: depot.Detachment = {
        slug: 'gladius-task-force',
        name: 'Gladius Task Force',
        abilities: [
          {
            id: 'gladius-ability',
            factionId: 'SM',
            name: 'Combat Doctrines',
            legend: 'Battle Tactic',
            description: 'Test ability',
            detachment: 'Gladius Task Force'
          }
        ],
        enhancements: [],
        stratagems: []
      };

      const action: RosterAction = {
        type: 'SET_DETACHMENT',
        payload: mockDetachment
      };

      const result = rosterReducer(currentState, action);

      expect(result.detachment).toEqual(mockDetachment);
      expect(result.id).toBe('test-id'); // Other properties unchanged
      expect(result.name).toBe('Test Roster');
      expect(result).not.toBe(currentState); // Ensure immutability
    });

    it('should not mutate original state', () => {
      const currentState: depot.Roster = {
        ...initialState,
        id: 'test-id',
        factionId: 'SM',
        factionSlug: 'space-marines',
        faction: mockFactionIndex,
        detachment: {
          slug: 'original-detachment',
          name: 'Original Detachment',
          abilities: [],
          enhancements: [],
          stratagems: []
        }
      };

      const newDetachment: depot.Detachment = {
        slug: 'new-detachment',
        name: 'New Detachment',
        abilities: [],
        enhancements: [],
        stratagems: []
      };

      const action: RosterAction = {
        type: 'SET_DETACHMENT',
        payload: newDetachment
      };

      const result = rosterReducer(currentState, action);

      expect(currentState.detachment.name).toBe('Original Detachment');
      expect(result.detachment.name).toBe('New Detachment');
    });
  });

  describe('ADD_UNIT', () => {
    it('should preselect wargear based on datasheet loadout', () => {
      const datasheet = createMockDatasheet({
        loadout: 'Every model is equipped with: Bolt pistol; Power sword.'
      });

      const action: RosterAction = {
        type: 'ADD_UNIT',
        payload: {
          datasheet,
          modelCost: datasheet.modelCosts[0]
        }
      };

      const result = rosterReducer(initialState, action);

      expect(result.units).toHaveLength(1);
      expect(result.units[0].selectedWargear).toEqual([datasheet.wargear[0], datasheet.wargear[2]]);
    });
  });

  describe('SET_WARLORD', () => {
    it('should set the warlord when unit exists', () => {
      const roster = createMockRoster({
        warlordUnitId: null,
        units: [mockRosterUnit]
      });

      const action: RosterAction = {
        type: 'SET_WARLORD',
        payload: { unitId: mockRosterUnit.id }
      };

      const result = rosterReducer(roster, action);

      expect(result.warlordUnitId).toBe(mockRosterUnit.id);
    });

    it('should clear the warlord when null provided', () => {
      const roster = createMockRoster({
        warlordUnitId: mockRosterUnit.id,
        units: [mockRosterUnit]
      });

      const action: RosterAction = {
        type: 'SET_WARLORD',
        payload: { unitId: null }
      };

      const result = rosterReducer(roster, action);

      expect(result.warlordUnitId).toBeNull();
    });
  });

  describe('REMOVE_UNIT', () => {
    it('should clear warlord when the designated unit is removed', () => {
      const roster = createMockRoster({
        warlordUnitId: mockRosterUnit.id,
        units: [mockRosterUnit]
      });

      const action: RosterAction = {
        type: 'REMOVE_UNIT',
        payload: { rosterUnitId: mockRosterUnit.id }
      };

      const result = rosterReducer(roster, action);

      expect(result.warlordUnitId).toBeNull();
      expect(result.units).toHaveLength(0);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state for any action', () => {
      const originalState = { ...initialState };

      const actions: RosterAction[] = [
        { type: 'SET_ROSTER', payload: { ...initialState, name: 'New Name' } },
        {
          type: 'CREATE_ROSTER',
          payload: {
            id: 'id',
            name: 'name',
            factionId: 'SM',
            factionSlug: 'space-marines',
            faction: mockFactionIndex,
            maxPoints: 2000,
            detachment: {
              slug: 'immutability-detachment',
              name: 'Test',
              abilities: [],
              enhancements: [],
              stratagems: []
            }
          }
        },
        {
          type: 'SET_DETACHMENT',
          payload: {
            slug: 'set-detachment',
            name: 'New Det',
            abilities: [],
            enhancements: [],
            stratagems: []
          }
        },
        {
          type: 'SET_WARLORD',
          payload: { unitId: null }
        }
      ];

      actions.forEach((action) => {
        const result = rosterReducer(initialState, action);
        expect(result).not.toBe(initialState);
        expect(initialState).toEqual(originalState);
      });
    });
  });
});
