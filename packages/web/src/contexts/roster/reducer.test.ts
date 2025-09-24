import { describe, it, expect } from 'vitest';
import { rosterReducer } from './reducer';
import { initialState } from './constants';
import type { RosterAction } from './types';
import { depot } from '@depot/core';
import { mockFactionIndex } from '@/test/mock-data';

describe('rosterReducer', () => {
  it('should return initial state for unknown action', () => {
    const result = rosterReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
    expect(result).toBe(initialState);
  });

  describe('SET_ROSTER', () => {
    it('should set the entire roster state', () => {
      const mockRoster: depot.Roster = {
        id: 'test-id',
        name: 'Test Roster',
        factionId: 'SM',
        faction: mockFactionIndex,
        detachment: {
          name: 'Test Detachment',
          abilities: [],
          enhancements: [],
          stratagems: []
        },
        points: {
          current: 500,
          max: 2000
        },
        units: [],
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
  });

  describe('CREATE_ROSTER', () => {
    it('should create a new roster with provided data', () => {
      const mockDetachment: depot.Detachment = {
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
          faction: { ...mockFactionIndex, id: 'CHAOS', name: 'Chaos Space Marines' },
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
        faction: { ...mockFactionIndex, id: 'CHAOS', name: 'Chaos Space Marines' },
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
          faction: mockFactionIndex,
          maxPoints: 2000,
          detachment: mockDetachment
        }
      };

      const result = rosterReducer(initialState, action);

      expect(result.detachment).toEqual(mockDetachment);
    });
  });

  describe('SET_DETACHMENT', () => {
    it('should update the detachment', () => {
      const currentState: depot.Roster = {
        ...initialState,
        id: 'test-id',
        name: 'Test Roster',
        factionId: 'SM'
      };

      const mockDetachment: depot.Detachment = {
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
        detachment: {
          name: 'Original Detachment',
          abilities: [],
          enhancements: [],
          stratagems: []
        }
      };

      const newDetachment: depot.Detachment = {
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
            faction: mockFactionIndex,
            maxPoints: 2000,
            detachment: { name: 'Test', abilities: [], enhancements: [], stratagems: [] }
          }
        },
        {
          type: 'SET_DETACHMENT',
          payload: { name: 'New Det', abilities: [], enhancements: [], stratagems: [] }
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
