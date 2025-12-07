import { FACTIONS_ACTIONS } from './constants';
import type { FactionsAction, FactionsState } from './types';

export const initialFactionsState: FactionsState = {
  factionIndex: null,
  offlineFactions: [],
  loading: false,
  error: null,
  dataVersion: null
};

export const factionsReducer = (state: FactionsState, action: FactionsAction): FactionsState => {
  switch (action.type) {
    case FACTIONS_ACTIONS.LOAD_INDEX_START:
      return { ...state, loading: true, error: null };
    case FACTIONS_ACTIONS.LOAD_INDEX_SUCCESS:
      return { ...state, loading: false, factionIndex: action.payload };
    case FACTIONS_ACTIONS.LOAD_INDEX_ERROR:
      return { ...state, loading: false, error: action.payload };
    case FACTIONS_ACTIONS.LOAD_FACTION_START:
      return { ...state, loading: true };
    case FACTIONS_ACTIONS.LOAD_FACTION_ERROR:
      return { ...state, loading: false, error: action.payload.error };
    case FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS:
      return { ...state, offlineFactions: action.payload };
    case FACTIONS_ACTIONS.SET_DATA_VERSION:
      return { ...state, dataVersion: action.payload };
    case FACTIONS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};
