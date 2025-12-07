import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useReducer } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { mergeSettingsWithDefaults } from '@/constants/settings';
import type { SettingsContextType } from './types';
import { initialSettingsState, settingsReducer } from './reducer';
import { SETTINGS_ACTIONS } from './constants';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);

  const loadSettings = useCallback(async () => {
    dispatch({ type: SETTINGS_ACTIONS.LOAD_SETTINGS_START });

    try {
      const stored = await offlineStorage.getSettings();
      if (stored) {
        const resolved = mergeSettingsWithDefaults(stored);
        dispatch({ type: SETTINGS_ACTIONS.LOAD_SETTINGS_SUCCESS, payload: resolved });
        return;
      }

      dispatch({ type: SETTINGS_ACTIONS.LOAD_SETTINGS_SUCCESS, payload: state.settings });
    } catch (error) {
      console.warn('Failed to load settings from IndexedDB:', error);
      dispatch({
        type: SETTINGS_ACTIONS.LOAD_SETTINGS_ERROR,
        payload: error instanceof Error ? error.message : 'Failed to load settings'
      });
    }
  }, [state.settings]);

  const updateSettings = useCallback(async (settings: depot.Settings) => {
    try {
      const merged = mergeSettingsWithDefaults(settings);
      await offlineStorage.setSettings(merged);
      dispatch({ type: SETTINGS_ACTIONS.UPDATE_SETTINGS, payload: merged });
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error);
      dispatch({
        type: SETTINGS_ACTIONS.UPDATE_SETTINGS,
        payload: mergeSettingsWithDefaults(settings)
      });
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const value: SettingsContextType = {
    state,
    updateSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsContext;
