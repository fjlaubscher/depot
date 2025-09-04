import { useState, useEffect } from 'react';
import { depot } from '@depot/core';
import { offlineStorage } from '../data/offline-storage';

interface UseFactions {
  factions: depot.Index[] | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useFactions(): UseFactions {
  const [factions, setFactions] = useState<depot.Index[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try IndexedDB first
      let index = await offlineStorage.getFactionIndex();

      if (!index) {
        // Fallback to network
        const response = await fetch('/data/index.json');
        if (!response.ok) {
          throw new Error('Failed to load faction index');
        }
        index = await response.json();

        // Cache for offline use
        try {
          await offlineStorage.setFactionIndex(index as depot.Index[]);
        } catch (cacheError) {
          console.warn('Failed to cache faction index:', cacheError);
        }
      }

      setFactions(index || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading factions';
      setError(errorMessage);
      console.error('Failed to load factions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFactions();
  }, []);

  return {
    factions,
    loading,
    error,
    refetch: loadFactions
  };
}

export default useFactions;
