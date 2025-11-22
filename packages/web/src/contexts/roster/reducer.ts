import type { depot } from '@depot/core';
import {
  getDefaultWargearSelection,
  normalizeDatasheetWargear,
  normalizeSelectedWargear
} from '@/utils/wargear';
import { normalizeSelectedWargearAbilities } from '@/utils/abilities';
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
        warlordUnitId: action.payload.warlordUnitId ?? null,
        units: action.payload.units.map((unit) => {
          const normalizedDatasheet = normalizeDatasheetWargear(unit.datasheet);
          return {
            ...unit,
            datasheet: normalizedDatasheet,
            selectedWargear: normalizeSelectedWargear(
              unit.selectedWargear,
              normalizedDatasheet.wargear
            ),
            selectedWargearAbilities: normalizeSelectedWargearAbilities(
              unit.selectedWargearAbilities,
              normalizedDatasheet.abilities
            ),
            datasheetSlug: unit.datasheetSlug ?? normalizedDatasheet.slug
          };
        })
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
        },
        warlordUnitId: null
      };

    case 'UPDATE_DETAILS': {
      const updatedState: depot.Roster = {
        ...state,
        name: action.payload.name,
        detachment: action.payload.detachment,
        points: {
          ...state.points,
          max: action.payload.maxPoints
        }
      };

      return {
        ...updatedState,
        points: {
          ...updatedState.points,
          current: calculateTotalPoints(updatedState)
        }
      };
    }

    case 'SET_DETACHMENT':
      return {
        ...state,
        detachment: action.payload
      };

    case 'ADD_UNIT': {
      const normalizedDatasheet = normalizeDatasheetWargear(action.payload.datasheet);
      const defaultWargear = getDefaultWargearSelection(normalizedDatasheet);
      const newUnit: depot.RosterUnit = {
        id: crypto.randomUUID(),
        datasheet: normalizedDatasheet,
        modelCost: action.payload.modelCost,
        selectedWargear: defaultWargear,
        selectedWargearAbilities: [],
        datasheetSlug: normalizedDatasheet.slug
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
        ),
        warlordUnitId:
          state.warlordUnitId === action.payload.rosterUnitId ? null : state.warlordUnitId
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

    case 'UPDATE_UNIT_WARGEAR_ABILITIES': {
      const updatedState = {
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.rosterUnitId
            ? { ...unit, selectedWargearAbilities: action.payload.abilities }
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

    case 'SET_WARLORD': {
      const { unitId } = action.payload;
      const nextWarlordId =
        unitId && state.units.some((unit) => unit.id === unitId) ? unitId : null;

      if (state.warlordUnitId === nextWarlordId) {
        return {
          ...state,
          warlordUnitId: state.warlordUnitId ?? null
        };
      }

      return {
        ...state,
        warlordUnitId: nextWarlordId
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
