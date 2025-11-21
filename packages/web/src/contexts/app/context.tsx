import type { FC, ReactNode } from 'react';
import { createContext, useReducer, useEffect, useCallback } from 'react';
import type { depot } from '@depot/core';
import type { AppContextType } from './types';
import { appReducer, initialState } from './reducer';
import { APP_ACTIONS } from './constants';
import { offlineStorage } from '@/data/offline-storage';
import { mergeSettingsWithDefaults } from '@/constants/settings';
import { getDataPath, getDataUrl, getDatasheetPath, getFactionManifestPath } from '@/utils/paths';
import { DATA_VERSION } from '@/constants/data-version';
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

  // Update my factions with offline storage
  const updateMyFactions = async (factions: depot.Option[]) => {
    try {
      await offlineStorage.setMyFactions(factions);
      dispatch({ type: APP_ACTIONS.UPDATE_MY_FACTIONS, payload: factions });
    } catch (error) {
      console.error('Failed to save my factions to IndexedDB:', error);
      throw error;
    }
  };

  // Initialize app data on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Load faction index
      dispatch({ type: APP_ACTIONS.LOAD_INDEX_START });

      try {
        try {
          const storedVersion = await offlineStorage.getDataVersion();
          if (storedVersion !== DATA_VERSION) {
            console.info('Resetting offline cache due to data version change', {
              storedVersion,
              dataVersion: DATA_VERSION
            });
            try {
              await offlineStorage.clearFactionData();
            } catch (clearError) {
              console.warn(
                'Failed to clear cached faction data, attempting full reset.',
                clearError
              );
              try {
                await offlineStorage.destroy();
              } catch (destroyError) {
                console.error('Failed to reset offline storage.', destroyError);
              }
            }
          }
        } catch (versionError) {
          console.warn('Failed to verify cached data version, forcing reset.', versionError);
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
        }

        try {
          await offlineStorage.setDataVersion(DATA_VERSION);
        } catch (persistError) {
          console.warn('Failed to persist data version marker.', persistError);
        }

        // Try IndexedDB first for index
        let index = await offlineStorage.getFactionIndex();

        if (!index) {
          // Fallback to network
          const indexPath = getDataPath('index.json');
          const response = await fetch(getDataUrl(indexPath));
          if (!response.ok) {
            throw new Error('Failed to load faction index');
          }
          index = await response.json();

          // Cache the index for offline use
          try {
            await offlineStorage.setFactionIndex(index as depot.Index[]);
          } catch (cacheError) {
            console.warn('Failed to cache faction index:', cacheError);
          }
        }

        if (index) {
          dispatch({ type: APP_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });
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

      // Load my factions (user favorites) from IndexedDB
      try {
        const myFactions = await offlineStorage.getMyFactions();
        dispatch({ type: APP_ACTIONS.LOAD_MY_FACTIONS_SUCCESS, payload: myFactions || [] });
      } catch (error) {
        console.warn('Failed to load my factions:', error);
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
    updateSettings,
    updateMyFactions
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;
