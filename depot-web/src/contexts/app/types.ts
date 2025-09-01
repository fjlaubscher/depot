import { depot } from 'depot-core';

// State interface
export interface AppState {
  factionIndex: depot.Index[] | null;
  factionCache: Record<string, depot.Faction>;
  offlineFactions: depot.Option[];
  loading: boolean;
  error: string | null;
  settings: depot.Settings | null;
}

// Action types
export type AppAction =
  | { type: 'LOAD_INDEX_START' }
  | { type: 'LOAD_INDEX_SUCCESS'; payload: depot.Index[] }
  | { type: 'LOAD_INDEX_ERROR'; payload: string }
  | { type: 'LOAD_FACTION_START'; payload: string }
  | { type: 'LOAD_FACTION_SUCCESS'; payload: { id: string; faction: depot.Faction } }
  | { type: 'LOAD_FACTION_ERROR'; payload: { id: string; error: string } }
  | { type: 'CACHE_FACTION_SUCCESS'; payload: { id: string; faction: depot.Faction } }
  | { type: 'CACHE_FACTION_ERROR'; payload: string }
  | { type: 'LOAD_SETTINGS_SUCCESS'; payload: depot.Settings }
  | { type: 'UPDATE_SETTINGS'; payload: depot.Settings }
  | { type: 'CLEAR_ERROR' };

// Context interface
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadFaction: (id: string) => Promise<void>;
  clearOfflineData: () => Promise<void>;
  updateSettings: (settings: depot.Settings) => Promise<void>;
}
