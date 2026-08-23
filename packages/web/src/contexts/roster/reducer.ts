import type { depot } from '@depot/core';
import {
  getDefaultWargearSelection,
  normalizeDatasheetWargear,
  normalizeSelectedWargear
} from '@depot/core/utils/wargear';
import { normalizeSelectedWargearAbilities } from '@depot/core/utils/abilities';
import type { RosterState, RosterAction } from './types';
import { initialState } from './constants';
import { calculateTotalPoints, getRosterDetachments } from '@depot/core/utils/roster';
import { enforceCostBrackets } from '@depot/core/utils/roster-legality';

type UnitLike = Pick<
  depot.RosterUnit,
  'datasheet' | 'selectedWargear' | 'selectedWargearAbilities' | 'datasheetSlug'
>;

/** Normalise a stored roster/collection unit against its datasheet (wargear, abilities, slug). */
export const normalizeUnit = <T extends UnitLike>(unit: T): T => {
  const normalizedDatasheet = normalizeDatasheetWargear(unit.datasheet);
  return {
    ...unit,
    datasheet: normalizedDatasheet,
    selectedWargear: normalizeSelectedWargear(unit.selectedWargear, normalizedDatasheet.wargear),
    selectedWargearAbilities: normalizeSelectedWargearAbilities(
      unit.selectedWargearAbilities,
      normalizedDatasheet.abilities
    ),
    datasheetSlug: unit.datasheetSlug ?? normalizedDatasheet.slug
  };
};

/** Re-apply repeat-cost brackets and recompute the points total after any change. */
const finalize = (state: depot.Roster): depot.Roster => {
  const units = enforceCostBrackets(state.units);
  const next = units.some((unit, index) => unit !== state.units[index])
    ? { ...state, units }
    : state;
  return { ...next, points: { ...next.points, current: calculateTotalPoints(next) } };
};

export const rosterReducer = (state: RosterState, action: RosterAction): RosterState => {
  switch (action.type) {
    case 'SET_ROSTER': {
      const { detachment: _legacyDetachment, ...payload } = action.payload;
      const fallbackSlug = payload.factionSlug ?? payload.faction?.slug ?? payload.factionId;

      return finalize({
        ...payload,
        dataVersion: payload.dataVersion ?? null,
        factionSlug: fallbackSlug,
        faction: payload.faction
          ? { ...payload.faction, slug: payload.faction.slug ?? fallbackSlug }
          : payload.faction,
        detachments: getRosterDetachments(action.payload),
        warlordUnitId: payload.warlordUnitId ?? null,
        units: payload.units.map(normalizeUnit)
      });
    }

    case 'CREATE_ROSTER':
      return finalize({
        ...initialState,
        id: action.payload.id,
        name: action.payload.name,
        factionId: action.payload.factionId,
        factionSlug: action.payload.factionSlug,
        faction: action.payload.faction,
        dataVersion: action.payload.dataVersion ?? null,
        detachments: action.payload.detachments,
        points: { current: 0, max: action.payload.maxPoints },
        warlordUnitId: null,
        units: action.payload.units?.map(normalizeUnit) ?? [],
        enhancements: [],
        collectionId: action.payload.collectionId ?? null
      });

    case 'UPDATE_DETAILS':
      return finalize({
        ...state,
        name: action.payload.name,
        detachments: action.payload.detachments,
        points: { ...state.points, max: action.payload.maxPoints }
      });

    case 'ADD_UNIT': {
      const normalizedDatasheet = normalizeDatasheetWargear(action.payload.datasheet);
      const newUnit: depot.RosterUnit = {
        id: crypto.randomUUID(),
        datasheet: normalizedDatasheet,
        modelCost: action.payload.modelCost,
        selectedWargear: getDefaultWargearSelection(normalizedDatasheet),
        selectedWargearAbilities: [],
        datasheetSlug: normalizedDatasheet.slug
      };
      return finalize({ ...state, units: [...state.units, newUnit] });
    }

    case 'DUPLICATE_UNIT':
      return finalize({
        ...state,
        units: [...state.units, { ...action.payload.unit, id: crypto.randomUUID() }]
      });

    case 'REMOVE_UNIT':
      return finalize({
        ...state,
        units: state.units.filter((unit) => unit.id !== action.payload.rosterUnitId),
        enhancements: state.enhancements.filter(
          (enhancement) => enhancement.unitId !== action.payload.rosterUnitId
        ),
        warlordUnitId:
          state.warlordUnitId === action.payload.rosterUnitId ? null : state.warlordUnitId
      });

    case 'UPDATE_UNIT_WARGEAR':
      return finalize({
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.rosterUnitId
            ? { ...unit, selectedWargear: action.payload.wargear }
            : unit
        )
      });

    case 'UPDATE_UNIT_WARGEAR_ABILITIES':
      return finalize({
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.rosterUnitId
            ? { ...unit, selectedWargearAbilities: action.payload.abilities }
            : unit
        )
      });

    case 'UPDATE_UNIT_MODEL_COST':
      return finalize({
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.rosterUnitId
            ? { ...unit, modelCost: action.payload.modelCost }
            : unit
        )
      });

    case 'APPLY_ENHANCEMENT':
      return finalize({
        ...state,
        enhancements: [
          ...state.enhancements,
          { enhancement: action.payload.enhancement, unitId: action.payload.targetUnitId }
        ]
      });

    case 'REMOVE_ENHANCEMENT':
      return finalize({
        ...state,
        enhancements: state.enhancements.filter(
          ({ enhancement }) => enhancement.id !== action.payload.enhancementId
        )
      });

    case 'SET_WARLORD': {
      const { unitId } = action.payload;
      return {
        ...state,
        warlordUnitId: unitId && state.units.some((unit) => unit.id === unitId) ? unitId : null
      };
    }

    default:
      return state;
  }
};
