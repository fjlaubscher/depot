import { AppState, AppAction } from './types';
import { APP_ACTIONS } from './constants';

// Initial state
export const initialState: AppState = {
  factionIndex: null,
  factionCache: {},
  offlineFactions: [],
  loading: false,
  error: null,
  settings: null
};

// Reducer
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case APP_ACTIONS.LOAD_INDEX_START:
      return { ...state, loading: true, error: null };

    case APP_ACTIONS.LOAD_INDEX_SUCCESS:
      return { ...state, loading: false, factionIndex: action.payload };

    case APP_ACTIONS.LOAD_INDEX_ERROR:
      return { ...state, loading: false, error: action.payload };

    case APP_ACTIONS.LOAD_FACTION_START:
      return { ...state, loading: true };

    case APP_ACTIONS.LOAD_FACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        factionCache: {
          ...state.factionCache,
          [action.payload.id]: action.payload.faction
        }
      };

    case APP_ACTIONS.LOAD_FACTION_ERROR:
      return { ...state, loading: false, error: action.payload.error };

    case APP_ACTIONS.CACHE_FACTION_SUCCESS:
      return {
        ...state,
        factionCache: {
          ...state.factionCache,
          [action.payload.id]: action.payload.faction
        },
        offlineFactions: [
          ...state.offlineFactions.filter((f) => f.id !== action.payload.id),
          { id: action.payload.id, name: action.payload.faction.name }
        ]
      };

    case APP_ACTIONS.CACHE_FACTION_ERROR:
      return { ...state, error: action.payload };

    case APP_ACTIONS.LOAD_SETTINGS_SUCCESS:
      return { ...state, settings: action.payload };

    case APP_ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: action.payload };

    case APP_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};
