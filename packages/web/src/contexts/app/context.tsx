import type { FC, ReactNode } from 'react';
import { createContext, useReducer, useEffect, useCallback } from 'react';
import type { depot } from '@depot/core';
import type { AppContextType } from './types';
import { appReducer, initialState } from './reducer';
import { APP_ACTIONS } from './constants';
import { offlineStorage } from '@/data/offline-storage';
import { mergeSettingsWithDefaults } from '@/constants/settings';
import { getDataPath, getDataUrl } from '@/utils/paths';
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

  // Get faction data directly from IndexedDB with network fallback
  const getFaction = useCallback(
    async (key: string): Promise<depot.Faction | null> => {
      try {
        const indexEntry = state.factionIndex?.find(
          (entry) => entry.slug === key || entry.id === key
        );
        const slug = indexEntry?.slug ?? key;

        // First, try to load from IndexedDB
        const cachedFaction = await offlineStorage.getFaction(slug);
        if (cachedFaction) {
          return cachedFaction;
        }

        const path = getDataPath(indexEntry?.path ?? `${slug}.json`);

        // If not cached, fetch from network
        const response = await fetch(getDataUrl(path));
        if (!response.ok) {
          throw new Error(`Failed to load faction ${slug}`);
        }
        const faction = (await response.json()) as depot.Faction;
        const normalizedFaction: depot.Faction = {
          ...faction,
          datasheets: faction.datasheets.map((datasheet) => normalizeDatasheetWargear(datasheet))
        };

        // Cache the faction in IndexedDB for offline use
        try {
          await offlineStorage.setFaction(slug, normalizedFaction);
          // Update offline factions list
          const offlineFactions = await offlineStorage.getAllCachedFactions();
          dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache faction in IndexedDB:', cacheError);
        }

        return normalizedFaction;
      } catch (error) {
        console.error(`Failed to load faction ${key}:`, error);
        return null;
      }
    },
    [state.factionIndex]
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
    getFaction,
    clearOfflineData,
    updateSettings,
    updateMyFactions
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;
