import { depot } from '@depot/core';

export type RosterState = depot.Roster;

export type RosterAction =
  | { type: 'SET_ROSTER'; payload: depot.Roster }
  | {
      type: 'CREATE_ROSTER';
      payload: { id: string; factionId: string; maxPoints: number; name: string };
    }
  | { type: 'SET_DETACHMENT'; payload: depot.Detachment };

export interface RosterContextValue {
  state: RosterState;
  createRoster: (payload: { factionId: string; maxPoints: number; name: string }) => string;
}
