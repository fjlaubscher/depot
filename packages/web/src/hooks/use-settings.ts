import { useState, useEffect } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '../data/offline-storage';

function useSettings(): [depot.Settings | undefined, (settings: depot.Settings) => Promise<void>] {
  const [settings, setSettings] = useState<depot.Settings | undefined>();

  // Load settings from IndexedDB on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await offlineStorage.getSettings();
        setSettings(storedSettings || undefined);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(undefined);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: depot.Settings) => {
    try {
      await offlineStorage.setSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  return [settings, updateSettings];
}

export default useSettings;
