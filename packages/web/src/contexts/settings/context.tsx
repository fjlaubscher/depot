import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { DEFAULT_SETTINGS, mergeSettingsWithDefaults } from '@/constants/settings';

export interface SettingsContextType {
  settings: depot.Settings;
  updateSettings: (settings: depot.Settings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<depot.Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    offlineStorage
      .getSettings()
      .then((stored) => {
        if (stored) {
          setSettings(mergeSettingsWithDefaults(stored));
        }
      })
      .catch((error) => console.warn('Failed to load settings from IndexedDB:', error));
  }, []);

  const updateSettings = useCallback(async (next: depot.Settings) => {
    const merged = mergeSettingsWithDefaults(next);
    try {
      await offlineStorage.setSettings(merged);
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error);
    }
    setSettings(merged);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
