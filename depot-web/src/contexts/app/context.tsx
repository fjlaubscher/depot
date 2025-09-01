import React, { createContext, useReducer, useEffect } from 'react';
import { depot } from 'depot-core';
import { AppContextType } from './types';
import { appReducer, initialState } from './reducer';
import { APP_ACTIONS } from './constants';
import { offlineStorage } from '../../data/offline-storage';

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load faction data with offline-first approach
  const loadFaction = async (id: string) => {
    if (state.factionCache[id]) {
      return; // Already cached in memory
    }

    dispatch({ type: APP_ACTIONS.LOAD_FACTION_START, payload: id });

    try {
      // First, try to load from IndexedDB
      const cachedFaction = await offlineStorage.getFaction(id);
      if (cachedFaction) {
        dispatch({
          type: APP_ACTIONS.LOAD_FACTION_SUCCESS,
          payload: { id, faction: cachedFaction }
        });
        return;
      }

      // If not cached, fetch from network
      const response = await fetch(`/data/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load faction ${id}`);
      }
      const faction = await response.json();

      // Cache the faction in IndexedDB for offline use
      try {
        await offlineStorage.setFaction(id, faction);
        dispatch({
          type: APP_ACTIONS.CACHE_FACTION_SUCCESS,
          payload: { id, faction }
        });
      } catch (cacheError) {
        // Still dispatch success for network load, but log cache error
        console.warn('Failed to cache faction in IndexedDB:', cacheError);
        dispatch({
          type: APP_ACTIONS.LOAD_FACTION_SUCCESS,
          payload: { id, faction }
        });
      }
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.LOAD_FACTION_ERROR,
        payload: { id, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  // Clear all offline data
  const clearOfflineData = async () => {
    try {
      await offlineStorage.clearAllData();
      // Reset the state by reloading faction index and clearing cache
      dispatch({ type: APP_ACTIONS.LOAD_INDEX_START });

      // Load fresh index from network (since IndexedDB was cleared)
      const response = await fetch('/data/index.json');
      if (!response.ok) {
        throw new Error('Failed to reload faction index after clearing cache');
      }
      const index = await response.json();

      // Cache the fresh index
      if (index) {
        await offlineStorage.setFactionIndex(index);
        dispatch({ type: APP_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });
      }

      // Reset the in-memory cache and offline factions list
      window.location.reload(); // Simplest way to ensure complete state reset
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.CACHE_FACTION_ERROR,
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
          const response = await fetch('/data/index.json');
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
        // Update state with current offline factions
        offlineFactions.forEach((faction) => {
          dispatch({
            type: APP_ACTIONS.CACHE_FACTION_SUCCESS,
            payload: { id: faction.id, faction: { ...faction } as any }
          });
        });
      } catch (error) {
        console.warn('Failed to load offline factions list:', error);
      }
    };

    initializeApp();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadFaction,
    clearOfflineData,
    updateSettings
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;
