import { depot } from '@depot/core';

// State interface
export interface AppState {
  factionIndex: depot.Index[] | null;
  offlineFactions: depot.Option[];
  myFactions: depot.Option[];
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
  | { type: 'LOAD_FACTION_ERROR'; payload: { id: string; error: string } }
  | { type: 'UPDATE_OFFLINE_FACTIONS'; payload: depot.Option[] }
  | { type: 'LOAD_MY_FACTIONS_SUCCESS'; payload: depot.Option[] }
  | { type: 'UPDATE_MY_FACTIONS'; payload: depot.Option[] }
  | { type: 'LOAD_SETTINGS_SUCCESS'; payload: depot.Settings }
  | { type: 'UPDATE_SETTINGS'; payload: depot.Settings }
  | { type: 'CLEAR_ERROR' };

// Context interface
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getFaction: (id: string) => Promise<depot.Faction | null>;
  clearOfflineData: () => Promise<void>;
  updateSettings: (settings: depot.Settings) => Promise<void>;
  updateMyFactions: (factions: depot.Option[]) => Promise<void>;
}
