import { useState, useEffect, useCallback } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { createRosterDuplicate } from '@/utils/roster';

interface UseRosters {
  rosters: depot.Roster[];
  loading: boolean;
  error: string | null;
  addRoster: (roster: depot.Roster) => Promise<void>;
  updateRoster: (roster: depot.Roster) => Promise<void>;
  deleteRoster: (rosterId: string) => Promise<void>;
  getRoster: (rosterId: string) => Promise<depot.Roster | null>;
  duplicateRoster: (roster: depot.Roster) => Promise<depot.Roster>;
}

function useRosters(): UseRosters {
  const [rosters, setRosters] = useState<depot.Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRosters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allRosters = await offlineStorage.getAllRosters();
      setRosters(allRosters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading rosters';
      setError(errorMessage);
      console.error('Failed to load rosters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRosters();
  }, [loadRosters]);

  const addRoster = async (roster: depot.Roster) => {
    await offlineStorage.saveRoster(roster);
    await loadRosters(); // Refresh the list
  };

  const updateRoster = async (roster: depot.Roster) => {
    await offlineStorage.saveRoster(roster); // `put` in IndexedDB handles both create and update
    await loadRosters();
  };

  const deleteRoster = async (rosterId: string) => {
    await offlineStorage.deleteRoster(rosterId);
    await loadRosters();
  };

  const getRoster = async (rosterId: string) => {
    return await offlineStorage.getRoster(rosterId);
  };

  const duplicateRoster = async (roster: depot.Roster) => {
    const duplicatedRoster = createRosterDuplicate(roster);
    await offlineStorage.saveRoster(duplicatedRoster);
    await loadRosters();
    return duplicatedRoster;
  };

  return {
    rosters,
    loading,
    error,
    addRoster,
    updateRoster,
    deleteRoster,
    getRoster,
    duplicateRoster
  };
}

export default useRosters;
