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
  createMockDetachment,
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
        dataVersion: null,
        detachments: [
          createMockDetachment({
            slug: 'test-detachment',
            name: 'Test Detachment'
          })
        ],
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
      const mockDetachment = createMockDetachment({
        slug: 'test-detachment',
        name: 'Test Detachment'
      });

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
          detachments: [mockDetachment]
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
        detachments: [mockDetachment],
        points: {
          current: 0,
          max: 1500
        }
      });
      expect(result).not.toBe(initialState); // Ensure immutability
    });

    it('should preserve initial detachment structure', () => {
      const mockDetachment = createMockDetachment({
        slug: 'combat-patrol',
        name: 'Combat Patrol'
      });

      const action: RosterAction = {
        type: 'CREATE_ROSTER',
        payload: {
          id: 'roster-id',
          name: 'Test',
          factionId: 'SM',
          factionSlug: 'space-marines',
          faction: mockFactionIndex,
          maxPoints: 2000,
          detachments: [mockDetachment]
        }
      };

      const result = rosterReducer(initialState, action);

      expect(result.detachments).toEqual([mockDetachment]);
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

      const updatedDetachment = createMockDetachment({
        slug: 'ironstorm-spearhead',
        name: 'Ironstorm Spearhead'
      });

      const action: RosterAction = {
        type: 'UPDATE_DETAILS',
        payload: {
          name: 'Updated Roster',
          detachments: [updatedDetachment],
          maxPoints: 1500
        }
      };

      const result = rosterReducer(startingState, action);

      expect(result.name).toBe('Updated Roster');
      expect(result.detachments).toEqual([updatedDetachment]);
      expect(result.points.max).toBe(1500);
      expect(result.points.current).toBe(80);
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

  describe('cost brackets', () => {
    it('moves repeat units onto the matching cost bracket as units are added and removed', () => {
      const datasheet = createMockDatasheet({
        id: 'talos',
        modelCosts: [
          {
            datasheetId: 'talos',
            line: '2',
            description: '1 model',
            cost: '75',
            section: 'YOUR 1ST TO 2ND UNITS COST'
          },
          {
            datasheetId: 'talos',
            line: '5',
            description: '1 model',
            cost: '85',
            section: 'YOUR 3RD + UNIT COSTS'
          }
        ]
      });
      const add: RosterAction = {
        type: 'ADD_UNIT',
        payload: { datasheet, modelCost: datasheet.modelCosts[0] }
      };

      let state = rosterReducer(createMockRoster({ units: [], enhancements: [] }), add);
      state = rosterReducer(state, add);
      state = rosterReducer(state, add);

      expect(state.units.map((unit) => unit.modelCost.cost)).toEqual(['75', '75', '85']);
      expect(state.points.current).toBe(235);

      state = rosterReducer(state, {
        type: 'REMOVE_UNIT',
        payload: { rosterUnitId: state.units[0].id }
      });
      expect(state.units.map((unit) => unit.modelCost.cost)).toEqual(['75', '75']);
      expect(state.points.current).toBe(150);
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
            detachments: [
              {
                slug: 'immutability-detachment',
                name: 'Test',
                id: 'immutability-detachment',
                legend: '',
                type: '',
                dp: '',
                forceDisposition: '',
                chapterDp: [],
                abilities: [],
                enhancements: [],
                stratagems: []
              }
            ]
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
