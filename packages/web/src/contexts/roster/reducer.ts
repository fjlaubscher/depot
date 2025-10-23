import type { depot } from '@depot/core';
import { getDefaultWargearSelection } from '@/utils/wargear';
import type { RosterState, RosterAction } from './types';
import { initialState } from './constants';
import { calculateTotalPoints } from './utils';

export const rosterReducer = (state: RosterState, action: RosterAction): RosterState => {
  switch (action.type) {
    case 'SET_ROSTER': {
      const fallbackSlug =
        action.payload.factionSlug ?? action.payload.faction?.slug ?? action.payload.factionId;

      const normalisedRoster: depot.Roster = {
        ...action.payload,
        factionSlug: fallbackSlug,
        faction: action.payload.faction
          ? { ...action.payload.faction, slug: action.payload.faction.slug ?? fallbackSlug }
          : action.payload.faction,
        units: action.payload.units.map((unit) => ({
          ...unit,
          datasheetSlug: unit.datasheetSlug ?? unit.datasheet.slug
        }))
      };

      return {
        ...normalisedRoster,
        points: {
          ...normalisedRoster.points,
          current: calculateTotalPoints(normalisedRoster)
        }
      };
    }

    case 'CREATE_ROSTER':
      return {
        ...initialState,
        id: action.payload.id,
        name: action.payload.name,
        factionId: action.payload.factionId,
        factionSlug: action.payload.factionSlug,
        faction: action.payload.faction,
        detachment: action.payload.detachment,
        points: {
          ...initialState.points,
          max: action.payload.maxPoints
        }
      };

    case 'SET_DETACHMENT':
      return {
        ...state,
        detachment: action.payload
      };

    case 'ADD_UNIT': {
      const defaultWargear = getDefaultWargearSelection(action.payload.datasheet);
      const newUnit: depot.RosterUnit = {
        id: crypto.randomUUID(),
        datasheet: action.payload.datasheet,
        modelCost: action.payload.modelCost,
        selectedWargear: defaultWargear,
        datasheetSlug: action.payload.datasheet.slug
      };

      const updatedState = {
        ...state,
        units: [...state.units, newUnit]
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'DUPLICATE_UNIT': {
      const duplicatedUnit: depot.RosterUnit = {
        ...action.payload.unit,
        id: crypto.randomUUID()
      };

      const updatedState = {
        ...state,
        units: [...state.units, duplicatedUnit]
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'REMOVE_UNIT': {
      const updatedState = {
        ...state,
        units: state.units.filter((unit) => unit.id !== action.payload.rosterUnitId),
        enhancements: state.enhancements.filter(
          (enhancement) => enhancement.unitId !== action.payload.rosterUnitId
        )
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'UPDATE_UNIT_WARGEAR': {
      const updatedState = {
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.rosterUnitId
            ? { ...unit, selectedWargear: action.payload.wargear }
            : unit
        )
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'UPDATE_UNIT_MODEL_COST': {
      const updatedState = {
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.rosterUnitId
            ? { ...unit, modelCost: action.payload.modelCost }
            : unit
        )
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'APPLY_ENHANCEMENT': {
      const updatedState = {
        ...state,
        enhancements: [
          ...state.enhancements,
          {
            enhancement: action.payload.enhancement,
            unitId: action.payload.targetUnitId
          }
        ]
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'REMOVE_ENHANCEMENT': {
      const updatedState = {
        ...state,
        enhancements: state.enhancements.filter(
          ({ enhancement }) => enhancement.id !== action.payload.enhancementId
        )
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'RECALCULATE_POINTS':
      return {
        ...state,
        points: {
          ...state.points,
          current: calculateTotalPoints(state)
        }
      };

    default:
      return state;
  }
};
