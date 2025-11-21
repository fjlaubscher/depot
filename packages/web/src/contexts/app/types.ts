import type { depot } from '@depot/core';
import type { CachedFaction } from '@/types/offline';

// State interface
export interface AppState {
  factionIndex: depot.Index[] | null;
  offlineFactions: CachedFaction[];
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
  | { type: 'LOAD_FACTION_ERROR'; payload: { slug: string; error: string } }
  | { type: 'UPDATE_OFFLINE_FACTIONS'; payload: CachedFaction[] }
  | { type: 'LOAD_MY_FACTIONS_SUCCESS'; payload: depot.Option[] }
  | { type: 'UPDATE_MY_FACTIONS'; payload: depot.Option[] }
  | { type: 'LOAD_SETTINGS_SUCCESS'; payload: depot.Settings }
  | { type: 'UPDATE_SETTINGS'; payload: depot.Settings }
  | { type: 'CLEAR_ERROR' };

// Context interface
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getFactionManifest: (slug: string) => Promise<depot.FactionManifest | null>;
  getDatasheet: (factionSlug: string, datasheetIdOrSlug: string) => Promise<depot.Datasheet | null>;
  clearOfflineData: () => Promise<void>;
  updateSettings: (settings: depot.Settings) => Promise<void>;
  updateMyFactions: (factions: depot.Option[]) => Promise<void>;
}
