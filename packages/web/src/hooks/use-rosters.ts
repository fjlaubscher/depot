import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { createRosterDuplicate } from '@depot/core/utils/roster';
import useAsync from './use-async';

interface UseRosters {
  rosters: depot.Roster[];
  loading: boolean;
  error: string | null;
  addRoster: (roster: depot.Roster) => Promise<void>;
  updateRoster: (roster: depot.Roster) => Promise<void>;
  deleteRoster: (rosterId: string) => Promise<void>;
  getRoster: (rosterId: string) => Promise<depot.Roster | null>;
  duplicateRoster: (roster: depot.Roster, dataVersion?: string | null) => Promise<depot.Roster>;
  refresh: () => Promise<void>;
}

function useRosters(): UseRosters {
  const { data, loading, error, refresh } = useAsync(() => offlineStorage.getAllRosters(), []);

  const addRoster = async (roster: depot.Roster) => {
    await offlineStorage.saveRoster(roster);
    await refresh(); // Refresh the list
  };

  const updateRoster = async (roster: depot.Roster) => {
    await offlineStorage.saveRoster(roster); // `put` in IndexedDB handles both create and update
    await refresh();
  };

  const deleteRoster = async (rosterId: string) => {
    await offlineStorage.deleteRoster(rosterId);
    await refresh();
  };

  const getRoster = async (rosterId: string) => {
    return await offlineStorage.getRoster(rosterId);
  };

  const duplicateRoster = async (roster: depot.Roster, dataVersion?: string | null) => {
    const duplicatedRoster = createRosterDuplicate(roster, { dataVersion });
    await offlineStorage.saveRoster(duplicatedRoster);
    await refresh();
    return duplicatedRoster;
  };

  return {
    rosters: data ?? [],
    loading,
    error,
    addRoster,
    updateRoster,
    deleteRoster,
    getRoster,
    duplicateRoster,
    refresh
  };
}

export default useRosters;
