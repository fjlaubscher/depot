import { useState, useEffect } from 'react';
import { depot } from '@depot/core';
import { offlineStorage } from '../data/offline-storage';

function useMyFactions(): [
  depot.Option[] | undefined,
  (factions: depot.Option[]) => Promise<void>
] {
  const [myFactions, setMyFactions] = useState<depot.Option[] | undefined>();

  // Load my factions from IndexedDB on mount
  useEffect(() => {
    const loadMyFactions = async () => {
      try {
        const factions = await offlineStorage.getMyFactions();
        setMyFactions(factions || []);
      } catch (error) {
        console.error('Failed to load my factions:', error);
        setMyFactions([]);
      }
    };

    loadMyFactions();
  }, []);

  const updateMyFactions = async (factions: depot.Option[]) => {
    try {
      await offlineStorage.setMyFactions(factions);
      setMyFactions(factions);
    } catch (error) {
      console.error('Failed to update my factions:', error);
      throw error;
    }
  };

  return [myFactions, updateMyFactions];
}

export default useMyFactions;
