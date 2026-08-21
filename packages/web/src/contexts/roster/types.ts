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
        dataVersion?: string | null;
        maxPoints: number;
        name: string;
        detachments: depot.Detachment[];
        units?: depot.RosterUnit[];
      };
    }
  | {
      type: 'UPDATE_DETAILS';
      payload: { name: string; detachments: depot.Detachment[]; maxPoints: number };
    }
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
  | { type: 'SET_WARLORD'; payload: { unitId: string | null } };

type Payload<T extends RosterAction['type']> = Extract<RosterAction, { type: T }>['payload'];

export interface RosterContextValue {
  state: RosterState;
  /** Returns the generated roster id. */
  createRoster: (payload: Omit<Payload<'CREATE_ROSTER'>, 'id'>) => string;
  updateRosterDetails: (payload: Payload<'UPDATE_DETAILS'>) => void;
  setRoster: (roster: Payload<'SET_ROSTER'>) => void;
  addUnit: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  duplicateUnit: (unit: depot.RosterUnit) => void;
  removeUnit: (rosterUnitId: string) => void;
  updateUnitWargear: (rosterUnitId: string, wargear: depot.Wargear[]) => void;
  updateUnitWargearAbilities: (rosterUnitId: string, abilities: depot.Ability[]) => void;
  updateUnitModelCost: (rosterUnitId: string, modelCost: depot.ModelCost) => void;
  applyEnhancement: (enhancement: depot.Enhancement, targetUnitId: string) => void;
  removeEnhancement: (enhancementId: string) => void;
  setWarlord: (unitId: string | null) => void;
}
