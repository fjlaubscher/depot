import type { depot } from '@depot/core';

export type RosterState = depot.Roster;

export type RosterAction =
  | { type: 'SET_ROSTER'; payload: depot.Roster }
  | {
      type: 'CREATE_ROSTER';
      payload: {
        id: string;
        factionId: string;
        factionSlug: string;
        faction: depot.Index;
        maxPoints: number;
        name: string;
        detachment: depot.Detachment;
        units?: depot.RosterUnit[];
      };
    }
  | {
      type: 'UPDATE_DETAILS';
      payload: { name: string; detachment: depot.Detachment; maxPoints: number };
    }
  | { type: 'SET_DETACHMENT'; payload: depot.Detachment }
  | { type: 'ADD_UNIT'; payload: { datasheet: depot.Datasheet; modelCost: depot.ModelCost } }
  | { type: 'DUPLICATE_UNIT'; payload: { unit: depot.RosterUnit } }
  | { type: 'REMOVE_UNIT'; payload: { rosterUnitId: string } }
  | { type: 'UPDATE_UNIT_WARGEAR'; payload: { rosterUnitId: string; wargear: depot.Wargear[] } }
  | {
      type: 'UPDATE_UNIT_WARGEAR_ABILITIES';
      payload: { rosterUnitId: string; abilities: depot.Ability[] };
    }
  | {
      type: 'UPDATE_UNIT_MODEL_COST';
      payload: { rosterUnitId: string; modelCost: depot.ModelCost };
    }
  | { type: 'APPLY_ENHANCEMENT'; payload: { enhancement: depot.Enhancement; targetUnitId: string } }
  | { type: 'REMOVE_ENHANCEMENT'; payload: { enhancementId: string } }
  | { type: 'SET_WARLORD'; payload: { unitId: string | null } }
  | { type: 'RECALCULATE_POINTS' }
  | {
      type: 'SET_COGITATOR_ANALYSIS';
      payload: depot.RosterCogitatorAnalysis | null;
    };

export interface RosterContextValue {
  state: RosterState;
  createRoster: (payload: {
    factionId: string;
    factionSlug: string;
    faction: depot.Index;
    maxPoints: number;
    name: string;
    detachment: depot.Detachment;
    units?: depot.RosterUnit[];
  }) => string;
  setDetachment: (detachment: depot.Detachment) => void;
  updateRosterDetails: (payload: {
    name: string;
    detachment: depot.Detachment;
    maxPoints: number;
  }) => void;
  addUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  duplicateUnit: (unit: depot.RosterUnit) => void;
  removeUnit: (rosterUnitId: string) => void;
  updateUnitWargear: (rosterUnitId: string, wargear: depot.Wargear[]) => void;
  updateUnitWargearAbilities: (rosterUnitId: string, abilities: depot.Ability[]) => void;
  updateUnitModelCost: (rosterUnitId: string, modelCost: depot.ModelCost) => void;
  applyEnhancement: (enhancement: depot.Enhancement, targetUnitId: string) => void;
  removeEnhancement: (enhancementId: string) => void;
  setWarlord: (unitId: string | null) => void;
  recalculatePoints: () => void;
  setCogitatorAnalysis: (analysis: depot.RosterCogitatorAnalysis | null) => void;
}
