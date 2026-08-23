import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { createRosterDuplicate } from '@depot/core/utils/roster';
import { useFactionsContext } from '@/contexts/factions/context';
import { hydrateRoster } from '@/utils/refresh-user-data';
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
  const { getDatasheet, getFactionManifest } = useFactionsContext();
  const { data, loading, error, refresh } = useAsync(async () => {
    const stored = await offlineStorage.getAllRosters();
    return Promise.all(
      stored.map((roster) => hydrateRoster(roster, { getDatasheet, getFactionManifest }))
    );
  }, [getDatasheet, getFactionManifest]);

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
