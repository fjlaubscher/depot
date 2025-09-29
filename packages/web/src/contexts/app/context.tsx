import type { FC, ReactNode } from 'react';
import { createContext, useReducer, useEffect, useCallback } from 'react';
import type { depot } from '@depot/core';
import type { AppContextType } from './types';
import { appReducer, initialState } from './reducer';
import { APP_ACTIONS } from './constants';
import { offlineStorage } from '@/data/offline-storage';
import { getDataUrl } from '@/utils/paths';

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

        const path = indexEntry?.path ?? `/data/${slug}.json`;

        // If not cached, fetch from network
        const response = await fetch(getDataUrl(path));
        if (!response.ok) {
          throw new Error(`Failed to load faction ${slug}`);
        }
        const faction = (await response.json()) as depot.Faction;

        // Cache the faction in IndexedDB for offline use
        try {
          await offlineStorage.setFaction(slug, faction);
          // Update offline factions list
          const offlineFactions = await offlineStorage.getAllCachedFactions();
          dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: offlineFactions });
        } catch (cacheError) {
          console.warn('Failed to cache faction in IndexedDB:', cacheError);
        }

        return faction;
      } catch (error) {
        console.error(`Failed to load faction ${key}:`, error);
        return null;
      }
    },
    [state.factionIndex]
  );

  // Clear all offline data
  const clearOfflineData = async () => {
    try {
      await offlineStorage.clearAllData();
      // Reset the state by reloading faction index and clearing cache
      dispatch({ type: APP_ACTIONS.LOAD_INDEX_START });

      // Load fresh index from network (since IndexedDB was cleared)
      const response = await fetch(getDataUrl('index.json'));
      if (!response.ok) {
        throw new Error('Failed to reload faction index after clearing cache');
      }
      const index = await response.json();

      // Cache the fresh index
      if (index) {
        await offlineStorage.setFactionIndex(index);
        dispatch({ type: APP_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });
      }

      // Reset the offline factions list
      dispatch({ type: APP_ACTIONS.UPDATE_OFFLINE_FACTIONS, payload: [] });
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.LOAD_INDEX_ERROR,
        payload: error instanceof Error ? error.message : 'Failed to clear offline data'
      });
      throw error;
    }
  };

  // Update settings with offline storage
  const updateSettings = async (settings: depot.Settings) => {
    try {
      await offlineStorage.setSettings(settings);
      dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: settings });
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error);
      // Still update in-memory state even if offline save fails
      dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: settings });
    }
  };

  // Update my factions with offline storage
  const updateMyFactions = async (factions: depot.Option[]) => {
    try {
      await offlineStorage.setMyFactions(factions);
      dispatch({ type: APP_ACTIONS.UPDATE_MY_FACTIONS, payload: factions });
    } catch (error) {
      console.error('Failed to save my factions to IndexedDB:', error);
      // Still update in-memory state even if offline save fails
      dispatch({ type: APP_ACTIONS.UPDATE_MY_FACTIONS, payload: factions });
      throw error;
    }
  };

  // Initialize app data on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Load faction index
      dispatch({ type: APP_ACTIONS.LOAD_INDEX_START });

      try {
        // Try IndexedDB first for index
        let index = await offlineStorage.getFactionIndex();

        if (!index) {
          // Fallback to network
          const response = await fetch(getDataUrl('index.json'));
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
          dispatch({ type: APP_ACTIONS.LOAD_SETTINGS_SUCCESS, payload: settings });
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
