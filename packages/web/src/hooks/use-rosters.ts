import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { createRosterDuplicate } from '@depot/core/utils/roster';
import useAsync from './use-async';

interface UseRosters {
  rosters: depot.Roster[];
  loading: boolean;
  error: string | null;
  deleteRoster: (rosterId: string) => Promise<void>;
  duplicateRoster: (roster: depot.Roster, dataVersion?: string | null) => Promise<depot.Roster>;
  refresh: () => Promise<void>;
}

function useRosters(): UseRosters {
  const { data, loading, error, refresh } = useAsync(() => offlineStorage.getAllRosters(), []);

  const deleteRoster = async (rosterId: string) => {
    await offlineStorage.deleteRoster(rosterId);
    await refresh();
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
    deleteRoster,
    duplicateRoster,
    refresh
  };
}

export default useRosters;
