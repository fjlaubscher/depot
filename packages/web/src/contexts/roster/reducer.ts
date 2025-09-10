import { depot } from '@depot/core';
import { RosterState, RosterAction } from './types';
import { initialState } from './constants';

export const rosterReducer = (state: RosterState, action: RosterAction): RosterState => {
  switch (action.type) {
    case 'SET_ROSTER':
      return action.payload;

    case 'CREATE_ROSTER':
      return {
        ...initialState,
        id: action.payload.id,
        name: action.payload.name,
        factionId: action.payload.factionId,
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

    default:
      return state;
  }
};
