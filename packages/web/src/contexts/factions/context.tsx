import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useReducer } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { getDataPath, getDataUrl, getDatasheetPath, getFactionManifestPath } from '@/utils/paths';
import { normalizeDatasheetWargear } from '@/utils/wargear';
import { FACTIONS_ACTIONS } from './constants';
import { factionsReducer, initialFactionsState } from './reducer';
import type { FactionsContextType } from './types';

const FactionsContext = createContext<FactionsContextType | undefined>(undefined);

interface FactionsProviderProps {
  children: ReactNode;
}

export const FactionsProvider: FC<FactionsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(factionsReducer, initialFactionsState);

  const resolveIndexDataVersion = useCallback(
    (index?: depot.Index[] | null): string | null =>
      index?.find((entry) => Boolean(entry.dataVersion))?.dataVersion ?? null,
    []
  );

  const fetchAndCacheIndex = useCallback(async (): Promise<depot.Index[]> => {
    const indexPath = getDataPath('index.json');
    const response = await fetch(getDataUrl(indexPath));
    if (!response.ok) {
      throw new Error('Failed to load faction index');
    }

    const fetchedIndex = (await response.json()) as depot.Index[];

    try {
      await offlineStorage.setFactionIndex(fetchedIndex);
    } catch (cacheError) {
      console.warn('Failed to cache faction index:', cacheError);
    }

    return fetchedIndex;
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
            !cachedManifest.dataVersion ||
            cachedManifest.dataVersion === currentVersion);

        if (shouldUseCached) {
          return cachedManifest;
        }

        const path = getFactionManifestPath(slug);
        const resolvedPath = indexEntry?.path ? getDataPath(indexEntry.path) : path;

        const response = await fetch(getDataUrl(resolvedPath));
        if (!response.ok) {
          throw new Error(`Failed to load faction ${slug}`);
        }

        const manifest = (await response.json()) as depot.FactionManifest;

        try {
          await offlineStorage.setFactionManifest(slug, manifest);
          const offlineFactions = await offlineStorage.getAllCachedFactions();
          dispatch({ type: FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache faction manifest in IndexedDB:', cacheError);
        }

        return manifest;
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
        const response = await fetch(getDataUrl(path));
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
    try {
      await resetOfflineData();
      dispatch({ type: FACTIONS_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: [] });
    } catch (error) {
      throw error;
    }
  };

  const checkForDataUpdates = useCallback(async (): Promise<{
    updated: boolean;
    dataVersion: string | null;
  }> => {
    try {
      const refreshedIndex = await fetchAndCacheIndex();
      const refreshedDataVersion = resolveIndexDataVersion(refreshedIndex);

      let storedVersion: string | null = null;
      try {
        storedVersion = await offlineStorage.getDataVersion();
      } catch (error) {
        console.warn('Failed to read stored data version while checking for updates.', error);
      }

      const currentVersion = state.dataVersion ?? storedVersion ?? null;
      const versionChanged =
        Boolean(refreshedDataVersion) && refreshedDataVersion !== currentVersion;

      if (versionChanged) {
        await resetOfflineData();
        const latestIndex = await fetchAndCacheIndex();
        const latestDataVersion = resolveIndexDataVersion(latestIndex);

        dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_SUCCESS, payload: latestIndex });

        const effectiveVersion = latestDataVersion ?? null;
        if (effectiveVersion) {
          try {
            await offlineStorage.setDataVersion(effectiveVersion);
          } catch (persistError) {
            console.warn('Failed to persist data version marker.', persistError);
          }
        }

        dispatch({
          type: FACTIONS_ACTIONS.SET_DATA_VERSION,
          payload: effectiveVersion
        });

        await refreshOfflineFactions();

        return { updated: true, dataVersion: effectiveVersion };
      }

      if (!state.factionIndex) {
        dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_SUCCESS, payload: refreshedIndex });
      }

      if (!state.dataVersion && refreshedDataVersion) {
        try {
          await offlineStorage.setDataVersion(refreshedDataVersion);
        } catch (persistError) {
          console.warn('Failed to persist data version marker.', persistError);
        }
        dispatch({ type: FACTIONS_ACTIONS.SET_DATA_VERSION, payload: refreshedDataVersion });
      }

      return { updated: false, dataVersion: refreshedDataVersion ?? currentVersion };
    } catch (error) {
      console.error('Failed to check for data updates:', error);
      return { updated: false, dataVersion: state.dataVersion };
    }
  }, [
    fetchAndCacheIndex,
    refreshOfflineFactions,
    resetOfflineData,
    resolveIndexDataVersion,
    state.dataVersion,
    state.factionIndex
  ]);

  useEffect(() => {
    const initializeData = async () => {
      dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_START });

      try {
        let storedVersion: string | null = null;
        let versionReadError: unknown = null;

        try {
          storedVersion = await offlineStorage.getDataVersion();
        } catch (versionError) {
          versionReadError = versionError;
          console.warn('Failed to verify cached data version, forcing reset.', versionError);
        }

        const loadIndexFromCache = async (): Promise<depot.Index[]> => {
          const cachedIndex = await offlineStorage.getFactionIndex();
          if (cachedIndex && cachedIndex.length > 0) {
            return cachedIndex;
          }
          return fetchAndCacheIndex();
        };

        let index = await loadIndexFromCache();

        let dataVersion = resolveIndexDataVersion(index);

        if (versionReadError) {
          await resetOfflineData();
          index = await fetchAndCacheIndex();
          dataVersion = resolveIndexDataVersion(index);
          storedVersion = dataVersion ?? storedVersion;
        }

        if (dataVersion && storedVersion !== dataVersion) {
          console.info('Resetting offline cache due to data version change', {
            storedVersion,
            dataVersion
          });
          await resetOfflineData();
          index = await fetchAndCacheIndex();
          dataVersion = resolveIndexDataVersion(index);
        }

        if (index) {
          dispatch({ type: FACTIONS_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });

          const effectiveDataVersion = dataVersion ?? storedVersion ?? null;

          if (effectiveDataVersion) {
            try {
              await offlineStorage.setDataVersion(effectiveDataVersion);
            } catch (persistError) {
              console.warn('Failed to persist data version marker.', persistError);
            }
          }

          dispatch({
            type: FACTIONS_ACTIONS.SET_DATA_VERSION,
            payload: effectiveDataVersion
          });
        } else {
          throw new Error('No faction index found');
        }
      } catch (error) {
        dispatch({
          type: FACTIONS_ACTIONS.LOAD_INDEX_ERROR,
          payload: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      await refreshOfflineFactions();
    };

    void initializeData();
  }, [fetchAndCacheIndex, refreshOfflineFactions, resetOfflineData, resolveIndexDataVersion]);

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
