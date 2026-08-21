import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  // Lets CSS hide fluff baked into rich-text HTML (e.g. `.ShowFluff` sub-ability legends).
  useEffect(() => {
    document.documentElement.classList.toggle('hide-fluff', settings.showFluff === false);
  }, [settings.showFluff]);

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

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
