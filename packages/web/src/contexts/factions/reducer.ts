import type { depot } from '@depot/core';
import type { CachedFaction } from '@/types/offline';

export interface FactionsState {
  factionIndex: depot.Index[] | null;
  offlineFactions: CachedFaction[];
  loading: boolean;
  error: string | null;
  dataVersion: string | null;
}

export type FactionsAction =
  | { type: 'LOAD_INDEX_START' }
  | { type: 'LOAD_INDEX_SUCCESS'; payload: depot.Index[] }
  | { type: 'LOAD_INDEX_ERROR'; payload: string }
  | { type: 'LOAD_FACTION_ERROR'; payload: { slug: string; error: string } }
  | { type: 'UPDATE_OFFLINE_FACTIONS'; payload: CachedFaction[] }
  | { type: 'SET_DATA_VERSION'; payload: string | null };

export const initialFactionsState: FactionsState = {
  factionIndex: null,
  offlineFactions: [],
  loading: false,
  error: null,
  dataVersion: null
};

export const factionsReducer = (state: FactionsState, action: FactionsAction): FactionsState => {
  switch (action.type) {
    case 'LOAD_INDEX_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_INDEX_SUCCESS':
      return { ...state, loading: false, factionIndex: action.payload };
    case 'LOAD_INDEX_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOAD_FACTION_ERROR':
      return { ...state, loading: false, error: action.payload.error };
    case 'UPDATE_OFFLINE_FACTIONS':
      return { ...state, offlineFactions: action.payload };
    case 'SET_DATA_VERSION':
      return { ...state, dataVersion: action.payload };
    default:
      return state;
  }
};
