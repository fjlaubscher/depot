import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useReducer } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { getDataPath, getDataUrl, getDatasheetPath, getFactionManifestPath } from '@/utils/paths';
import { normalizeDatasheetWargear } from '@depot/core/utils/wargear';
import { FACTIONS_ACTIONS } from './constants';
import { factionsReducer, initialFactionsState } from './reducer';
import { syncFactionIndex } from './index-sync';
import { appendSearchParam } from './url';
import type { FactionsContextType } from './types';

const FactionsContext = createContext<FactionsContextType | undefined>(undefined);

interface FactionsProviderProps {
  children: ReactNode;
}

export const FactionsProvider: FC<FactionsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(factionsReducer, initialFactionsState);

  const fetchIndex = useCallback(async (): Promise<depot.Index[]> => {
    const indexPath = getDataPath('index.json');
    const url = appendSearchParam(getDataUrl(indexPath), 't', Date.now().toString());
    const response = await fetch(url, { cache: 'no-store' });
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
      dispatch({ type: FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
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

        const manifestUrlBase = getDataUrl(resolvedPath);
        const manifestUrl = state.dataVersion
          ? appendSearchParam(manifestUrlBase, 'v', state.dataVersion)
          : manifestUrlBase;
        const response = await fetch(manifestUrl, { cache: 'no-store' });
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
          dispatch({ type: FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache faction manifest in IndexedDB:', cacheError);
        }

        return manifestWithVersion;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to load faction ${key}:`, error);
        dispatch({
          type: FACTIONS_ACTIONS.LOAD_FACTION_ERROR,
          payload: { slug: key, error: message }
        });
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
        const datasheetUrlBase = getDataUrl(path);
        const datasheetUrl = state.dataVersion
          ? appendSearchParam(datasheetUrlBase, 'v', state.dataVersion)
          : datasheetUrlBase;
        const response = await fetch(datasheetUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load datasheet ${reference.id}`);
        }

        const datasheet = (await response.json()) as depot.Datasheet;
        const normalized = normalizeDatasheetWargear(datasheet);

        try {
          await offlineStorage.setDatasheet(normalized);
          const offlineFactions = await offlineStorage.getAllCachedFactions();
          dispatch({ type: FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
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
    dispatch({ type: FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: [] });
  };

  const checkForDataUpdates = useCallback(async () => {
    try {
      const result = await syncFactionIndex({
        fetchIndex,
        storage: offlineStorage,
        resetOfflineData
      });

      dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_SUCCESS, payload: result.index });
      dispatch({ type: FACTIONS_ACTIONS.SET_DATA_VERSION, payload: result.dataVersion });

      await refreshOfflineFactions();
      return { updated: result.updated, dataVersion: result.dataVersion };
    } catch (error) {
      console.error('Failed to check for data updates:', error);
      return { updated: false, dataVersion: state.dataVersion };
    }
  }, [fetchIndex, refreshOfflineFactions, resetOfflineData, state.dataVersion]);

  useEffect(() => {
    const initializeData = async () => {
      dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_START });

      try {
        const { index, dataVersion } = await syncFactionIndex({
          fetchIndex,
          storage: offlineStorage,
          resetOfflineData
        });

        dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });
        dispatch({ type: FACTIONS_ACTIONS.SET_DATA_VERSION, payload: dataVersion });
      } catch (error) {
        dispatch({
          type: FACTIONS_ACTIONS.LOAD_INDEX_ERROR,
          payload: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      await refreshOfflineFactions();
    };

    void initializeData();
  }, [fetchIndex, refreshOfflineFactions, resetOfflineData]);

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
    state,
    getFactionManifest,
    getDatasheet,
    clearOfflineData,
    checkForDataUpdates
  };

  return <FactionsContext.Provider value={value}>{children}</FactionsContext.Provider>;
};

export default FactionsContext;
