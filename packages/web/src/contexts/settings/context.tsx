import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { DEFAULT_SETTINGS, mergeSettingsWithDefaults } from '@/constants/settings';
import { applyTheme } from '@/utils/theme';

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

  // `.dark` class strategy — follows the OS while the setting is 'system'.
  useEffect(() => {
    const theme = settings.theme ?? 'system';
    applyTheme(theme);

    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [settings.theme]);

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
