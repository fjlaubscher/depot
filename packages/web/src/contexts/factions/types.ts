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
  | { type: 'LOAD_FACTION_START'; payload: string }
  | { type: 'LOAD_FACTION_ERROR'; payload: { slug: string; error: string } }
  | { type: 'UPDATE_OFFLINE_FACTIONS'; payload: CachedFaction[] }
  | { type: 'SET_DATA_VERSION'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

export interface FactionsContextType {
  state: FactionsState;
  getFactionManifest: (slug: string) => Promise<depot.FactionManifest | null>;
  getDatasheet: (factionSlug: string, datasheetIdOrSlug: string) => Promise<depot.Datasheet | null>;
  clearOfflineData: () => Promise<void>;
  checkForDataUpdates: () => Promise<{ updated: boolean; dataVersion: string | null }>;
}
