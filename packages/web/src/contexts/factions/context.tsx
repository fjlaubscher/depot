import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { getDataPath, getDataUrl, getDatasheetPath, getFactionManifestPath } from '@/utils/paths';
import { normalizeDatasheetWargear } from '@depot/core/utils/wargear';
import { factionsReducer, initialFactionsState } from './reducer';
import type { FactionsState } from './reducer';
import { syncFactionIndex } from './index-sync';

export interface FactionsContextType extends FactionsState {
  getFactionManifest: (slug: string) => Promise<depot.FactionManifest | null>;
  getDatasheet: (factionSlug: string, datasheetIdOrSlug: string) => Promise<depot.Datasheet | null>;
  clearOfflineData: () => Promise<void>;
  checkForDataUpdates: () => Promise<void>;
}

const FactionsContext = createContext<FactionsContextType | undefined>(undefined);

interface FactionsProviderProps {
  children: ReactNode;
}

export const FactionsProvider: FC<FactionsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(factionsReducer, initialFactionsState);

  const fetchIndex = useCallback(async (): Promise<depot.Index[]> => {
    const response = await fetch(getDataUrl(getDataPath('index.json')), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load faction index');
    }

    return (await response.json()) as depot.Index[];
  }, []);

  const resetOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearFactionData();
    } catch (clearError) {
      console.warn('Failed to clear cached faction data, attempting full reset.', clearError);
      try {
        await offlineStorage.destroy();
      } catch (destroyError) {
        console.error('Failed to reset offline storage.', destroyError);
      }
    }
  }, []);

  const refreshOfflineFactions = useCallback(async () => {
    try {
      const offlineFactions = await offlineStorage.getAllCachedFactions();
      dispatch({ type: 'UPDATE_OFFLINE_FACTIONS', payload: offlineFactions });
    } catch (error) {
      console.warn('Failed to load offline factions list:', error);
    }
  }, []);

  const getFactionManifest = useCallback(
    async (key: string): Promise<depot.FactionManifest | null> => {
      try {
        const indexEntry = state.factionIndex?.find(
          (entry) => entry.slug === key || entry.id === key
        );
        const slug = indexEntry?.slug ?? key;

        const cachedManifest = await offlineStorage.getFactionManifest(slug);
        const currentVersion = state.dataVersion;
        const shouldUseCached =
          cachedManifest &&
          (!currentVersion ||
            (Boolean(cachedManifest.dataVersion) && cachedManifest.dataVersion === currentVersion));

        if (shouldUseCached) {
          return cachedManifest;
        }

        const path = getFactionManifestPath(slug);
        const resolvedPath = indexEntry?.path ? getDataPath(indexEntry.path) : path;

        const response = await fetch(getDataUrl(resolvedPath), { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load faction ${slug}`);
        }

        const manifest = (await response.json()) as depot.FactionManifest;
        const manifestWithVersion =
          !manifest.dataVersion && state.dataVersion
            ? { ...manifest, dataVersion: state.dataVersion }
            : manifest;

        try {
          await offlineStorage.setFactionManifest(slug, manifestWithVersion);
          const offlineFactions = await offlineStorage.getAllCachedFactions();
          dispatch({ type: 'UPDATE_OFFLINE_FACTIONS', payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache faction manifest in IndexedDB:', cacheError);
        }

        return manifestWithVersion;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to load faction ${key}:`, error);
        dispatch({ type: 'LOAD_INDEX_ERROR', payload: message });
        return null;
      }
    },
    [state.dataVersion, state.factionIndex]
  );

  const getDatasheet = useCallback(
    async (factionSlug: string, datasheetIdOrSlug: string): Promise<depot.Datasheet | null> => {
      try {
        const manifest = await getFactionManifest(factionSlug);
        if (!manifest) {
          throw new Error(`Missing manifest for ${factionSlug}`);
        }

        const reference = manifest.datasheets.find(
          (sheet) => sheet.id === datasheetIdOrSlug || sheet.slug === datasheetIdOrSlug
        );

        if (!reference) {
          throw new Error(`Datasheet ${datasheetIdOrSlug} not found for ${factionSlug}`);
        }

        const cachedDatasheet = await offlineStorage.getDatasheet(reference.id);
        if (cachedDatasheet) {
          return cachedDatasheet;
        }

        const path = getDataPath(reference.path || getDatasheetPath(manifest.slug, reference.id));
        const response = await fetch(getDataUrl(path), { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load datasheet ${reference.id}`);
        }

        const datasheet = (await response.json()) as depot.Datasheet;
        const normalized = normalizeDatasheetWargear(datasheet);

        try {
          await offlineStorage.setDatasheet(normalized);
          const offlineFactions = await offlineStorage.getAllCachedFactions();
          dispatch({ type: 'UPDATE_OFFLINE_FACTIONS', payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache datasheet in IndexedDB:', cacheError);
        }

        return normalized;
      } catch (error) {
        console.error(
          `Failed to load datasheet ${datasheetIdOrSlug} for faction ${factionSlug}:`,
          error
        );
        return null;
      }
    },
    [getFactionManifest]
  );

  const clearOfflineData = async () => {
    await resetOfflineData();
    dispatch({ type: 'UPDATE_OFFLINE_FACTIONS', payload: [] });
  };

  /** Sync the faction index (network → cache fallback); used on mount and on online/visibility. */
  const checkForDataUpdates = useCallback(async () => {
    try {
      const { index, dataVersion } = await syncFactionIndex({
        fetchIndex,
        storage: offlineStorage,
        resetOfflineData
      });
      dispatch({ type: 'LOAD_INDEX_SUCCESS', payload: index });
      dispatch({ type: 'SET_DATA_VERSION', payload: dataVersion });
    } catch (error) {
      console.error('Failed to load faction index:', error);
      dispatch({
        type: 'LOAD_INDEX_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    await refreshOfflineFactions();
  }, [fetchIndex, refreshOfflineFactions, resetOfflineData]);

  useEffect(() => {
    dispatch({ type: 'LOAD_INDEX_START' });
    void checkForDataUpdates();
  }, [checkForDataUpdates]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForDataUpdates();
      }
    };

    window.addEventListener('online', checkForDataUpdates);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', checkForDataUpdates);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForDataUpdates]);

  const value: FactionsContextType = {
    ...state,
    getFactionManifest,
    getDatasheet,
    clearOfflineData,
    checkForDataUpdates
  };

  return <FactionsContext.Provider value={value}>{children}</FactionsContext.Provider>;
};

export const useFactionsContext = (): FactionsContextType => {
  const context = useContext(FactionsContext);
  if (!context) {
    throw new Error('useFactionsContext must be used within a FactionsProvider');
  }
  return context;
};

export default FactionsContext;
