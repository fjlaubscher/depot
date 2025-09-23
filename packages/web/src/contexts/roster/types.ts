import { depot } from '@depot/core';

export type RosterState = depot.Roster;

export type RosterAction =
  | { type: 'SET_ROSTER'; payload: depot.Roster }
  | {
      type: 'CREATE_ROSTER';
      payload: {
        id: string;
        factionId: string;
        faction: depot.Index;
        maxPoints: number;
        name: string;
        detachment: depot.Detachment;
      };
    }
  | { type: 'SET_DETACHMENT'; payload: depot.Detachment }
  | { type: 'ADD_UNIT'; payload: { datasheet: depot.Datasheet; modelCost: depot.ModelCost } }
  | { type: 'DUPLICATE_UNIT'; payload: { unit: depot.RosterUnit } }
  | { type: 'REMOVE_UNIT'; payload: { rosterUnitId: string } }
  | { type: 'UPDATE_UNIT_WARGEAR'; payload: { rosterUnitId: string; wargear: depot.Wargear[] } }
  | {
      type: 'UPDATE_UNIT_MODEL_COST';
      payload: { rosterUnitId: string; modelCost: depot.ModelCost };
    }
  | { type: 'APPLY_ENHANCEMENT'; payload: { enhancement: depot.Enhancement; targetUnitId: string } }
  | { type: 'REMOVE_ENHANCEMENT'; payload: { enhancementId: string } }
  | { type: 'RECALCULATE_POINTS' };

export interface RosterContextValue {
  state: RosterState;
  createRoster: (payload: {
    factionId: string;
    faction: depot.Index;
    maxPoints: number;
    name: string;
    detachment: depot.Detachment;
  }) => string;
  setDetachment: (detachment: depot.Detachment) => void;
  addUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  duplicateUnit: (unit: depot.RosterUnit) => void;
  removeUnit: (rosterUnitId: string) => void;
  updateUnitWargear: (rosterUnitId: string, wargear: depot.Wargear[]) => void;
  updateUnitModelCost: (rosterUnitId: string, modelCost: depot.ModelCost) => void;
  applyEnhancement: (enhancement: depot.Enhancement, targetUnitId: string) => void;
  removeEnhancement: (enhancementId: string) => void;
  recalculatePoints: () => void;
}
