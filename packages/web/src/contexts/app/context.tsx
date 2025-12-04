import type { FC, ReactNode } from 'react';
import { createContext, useReducer, useEffect, useCallback } from 'react';
import type { depot } from '@depot/core';
import type { AppContextType } from './types';
import { appReducer, initialState } from './reducer';
import { APP_ACTIONS } from './constants';
import { offlineStorage } from '@/data/offline-storage';
import { mergeSettingsWithDefaults } from '@/constants/settings';
import { getDataPath, getDataUrl, getDatasheetPath, getFactionManifestPath } from '@/utils/paths';
import { normalizeDatasheetWargear } from '@/utils/wargear';

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Get faction manifest with network fallback
  const getFactionManifest = useCallback(
    async (key: string): Promise<depot.FactionManifest | null> => {
      try {
        const indexEntry = state.factionIndex?.find(
          (entry) => entry.slug === key || entry.id === key
        );
        const slug = indexEntry?.slug ?? key;

        const cachedManifest = await offlineStorage.getFactionManifest(slug);
        if (cachedManifest) {
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
          dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache faction manifest in IndexedDB:', cacheError);
        }

        return manifest;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to load faction ${key}:`, error);
        dispatch({
          type: APP_ACTIONS.LOAD_FACTION_ERROR,
          payload: { slug: key, error: message }
        });
        return null;
      }
    },
    [state.factionIndex]
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
          dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
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

  // Clear cached faction data
  const clearOfflineData = async () => {
    try {
      await offlineStorage.clearFactionData();
      dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: [] });
    } catch (error) {
      throw error;
    }
  };

  // Update settings with offline storage
  const updateSettings = async (settings: depot.Settings) => {
    try {
      const mergedSettings = mergeSettingsWithDefaults(settings);
      await offlineStorage.setSettings(mergedSettings);
      dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: mergedSettings });
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error);
      // Still update in-memory state even if offline save fails
      dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: mergeSettingsWithDefaults(settings) });
    }
  };

  // Initialize app data on mount
  useEffect(() => {
    const resolveIndexDataVersion = (index?: depot.Index[] | null): string | null =>
      index?.find((entry) => Boolean(entry.dataVersion))?.dataVersion ?? null;

    const fetchAndCacheIndex = async (): Promise<depot.Index[]> => {
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
    };

    const resetOfflineData = async () => {
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
    };

    const initializeApp = async () => {
      // Load faction index
      dispatch({ type: APP_ACTIONS.LOAD_INDEX_START });

      try {
        let storedVersion: string | null = null;
        let versionReadError: unknown = null;

        try {
          storedVersion = await offlineStorage.getDataVersion();
        } catch (versionError) {
          versionReadError = versionError;
          console.warn('Failed to verify cached data version, forcing reset.', versionError);
        }

        // Try IndexedDB first for index
        let index = await offlineStorage.getFactionIndex();

        if (!index) {
          index = await fetchAndCacheIndex();
        }

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
          dispatch({ type: APP_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });

          const effectiveDataVersion = dataVersion ?? storedVersion;

          if (effectiveDataVersion) {
            try {
              await offlineStorage.setDataVersion(effectiveDataVersion);
            } catch (persistError) {
              console.warn('Failed to persist data version marker.', persistError);
            }
          }

          dispatch({
            type: APP_ACTIONS.SET_DATA_VERSION,
            payload: effectiveDataVersion ?? null
          });
        } else {
          throw new Error('No faction index found');
        }
      } catch (error) {
        dispatch({
          type: APP_ACTIONS.LOAD_INDEX_ERROR,
          payload: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Load settings from IndexedDB
      try {
        const settings = await offlineStorage.getSettings();
        if (settings) {
          const resolvedSettings = mergeSettingsWithDefaults(settings);
          dispatch({
            type: APP_ACTIONS.LOAD_SETTINGS_SUCCESS,
            payload: resolvedSettings
          });
        }
      } catch (error) {
        console.warn('Failed to load settings from IndexedDB:', error);
      }

      // Load list of cached factions for settings page
      try {
        const offlineFactions = await offlineStorage.getAllCachedFactions();
        dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
      } catch (error) {
        console.warn('Failed to load offline factions list:', error);
      }
    };

    initializeApp();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    getFactionManifest,
    getDatasheet,
    clearOfflineData,
    updateSettings
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;
