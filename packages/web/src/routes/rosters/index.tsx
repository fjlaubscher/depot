import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import useRosters from '@/hooks/use-rosters';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { readJsonFile } from '@/utils/file';
import { isExportedRoster } from '@/types/export';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, ErrorState } from '@/components/ui';
import ImportButton from '@/components/shared/import-button';
import { ListEmptyState } from '@/components/shared';
import { RosterCard } from './_components/roster-card';

const Rosters: React.FC = () => {
  const navigate = useNavigate();
  const { rosters, loading, error, deleteRoster, duplicateRoster, refresh } = useRosters();
  const { showToast } = useToast();
  const { state: appState } = useAppContext();

  const handleCreate = () => {
    navigate('/rosters/create');
  };

  const handleDeleteRoster = async (rosterId: string) => {
    try {
      await deleteRoster(rosterId);
      showToast({
        type: 'success',
        title: 'Roster Deleted',
        message: 'The roster has been successfully deleted.'
      });
    } catch (error) {
      console.error('Failed to delete roster:', error);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the roster. Please try again.'
      });
    }
  };

  const handleDuplicateRoster = async (roster: depot.Roster) => {
    try {
      const duplicated = await duplicateRoster(roster, appState.dataVersion ?? roster.dataVersion);
      showToast({
        type: 'success',
        title: 'Roster Duplicated',
        message: `Created ${duplicated.name}.`
      });
    } catch (error) {
      console.error('Failed to duplicate roster:', error);
      showToast({
        type: 'error',
        title: 'Duplicate Failed',
        message: 'Could not duplicate the roster. Please try again.'
      });
    }
  };

  const remapRosterIds = (roster: depot.Roster): depot.Roster => {
    const unitIdMap = new Map<string, string>();
    const units = roster.units.map((unit) => {
      const newId = crypto.randomUUID();
      unitIdMap.set(unit.id, newId);
      return { ...unit, id: newId };
    });

    const enhancements = roster.enhancements
      .map((enhancement) => {
        const newUnitId = unitIdMap.get(enhancement.unitId);
        if (!newUnitId) {
          console.warn('Skipping enhancement with missing unit during import', enhancement.unitId);
          return null;
        }
        return { ...enhancement, unitId: newUnitId };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));

    const warlordUnitId = roster.warlordUnitId
      ? (unitIdMap.get(roster.warlordUnitId) ?? null)
      : null;

    return {
      ...roster,
      id: crypto.randomUUID(),
      units,
      enhancements,
      warlordUnitId
    };
  };

  const handleImportRosterFile = async (file: File) => {
    try {
      const parsed = await readJsonFile<unknown>(file);
      if (!isExportedRoster(parsed) || parsed.version !== 1) {
        showToast({
          type: 'error',
          title: 'Import failed',
          message: 'This file does not look like a depot roster export.'
        });
        return;
      }

      const imported = remapRosterIds(parsed.roster);
      await offlineStorage.saveRoster(imported);
      await refresh();
      showToast({
        type: 'success',
        title: 'Roster imported',
        message: `Imported "${imported.name}".`
      });
    } catch (err) {
      console.error('Failed to import roster', err);
      showToast({
        type: 'error',
        title: 'Import failed',
        message: 'Could not import this roster. Please check the file and try again.'
      });
    }
  };

  return (
    <AppLayout title="Roster Library">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="My Rosters"
          subtitle="Manage your army rosters"
          action={{
            icon: <Plus size={16} />,
            onClick: handleCreate,
            ariaLabel: 'Create new roster'
          }}
        />
        <div className="flex flex-wrap gap-3">
          <ImportButton
            label="Import roster"
            onFileSelected={handleImportRosterFile}
            buttonTestId="import-roster-button"
            inputTestId="import-roster-input"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load rosters" message={error} />
        ) : rosters.length === 0 ? (
          <ListEmptyState
            title="No rosters yet"
            actionLabel="Create roster"
            onAction={handleCreate}
            testId="empty-rosters"
          />
        ) : (
          <div
            data-testid="rosters-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {rosters.map((roster) => (
              <RosterCard
                key={roster.id}
                roster={roster}
                onDelete={handleDeleteRoster}
                onDuplicate={handleDuplicateRoster}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Rosters;
