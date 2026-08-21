import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import useRosters from '@/hooks/use-rosters';
import { useToast } from '@/contexts/toast/context';
import { useFactionsContext } from '@/contexts/factions/context';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { readJsonFile } from '@/utils/file';
import { isExportedRoster } from '@/types/export';
import { formatRebindSummaryMessage, refreshRosterDataWithReport } from '@/utils/refresh-user-data';
import { getRosterDetachments, remapRosterIds } from '@depot/core/utils/roster';

import AppLayout from '@/components/layout';
import { Alert, PageHeader, Loader, ErrorState, Tag } from '@/components/ui';
import ImportButton from '@/components/shared/import-button';
import LibraryCard from '@/components/shared/library-card';
import { RosterEmptyState } from '@/components/shared/roster';
import CreateRosterSheet from './_components/create-roster-sheet';

const Rosters: React.FC = () => {
  const { rosters, loading, error, deleteRoster, duplicateRoster, refresh } = useRosters();
  const { showToast } = useToast();
  const { dataVersion, getDatasheet, getFactionManifest } = useFactionsContext();

  const hasStaleRosters = Boolean(
    dataVersion && rosters.some((roster) => roster.dataVersion !== dataVersion)
  );

  const [createOpen, setCreateOpen] = useState(false);

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
      const duplicated = await duplicateRoster(roster, dataVersion ?? roster.dataVersion);
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

  const handleImportRosterFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

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

      let imported = remapRosterIds(parsed.roster);
      let rebindNote: string | null = null;
      // Migrate legacy exports onto the current catalog (10th → 11th rebinds by id/slug/name).
      if (dataVersion && imported.dataVersion !== dataVersion) {
        const result = await refreshRosterDataWithReport({
          roster: imported,
          currentDataVersion: dataVersion,
          getDatasheet,
          getFactionManifest
        });
        imported = result.roster;
        rebindNote = formatRebindSummaryMessage(result.summary);
      }
      await offlineStorage.saveRoster(imported);
      await refresh();
      showToast({
        type: rebindNote ? 'warning' : 'success',
        title: 'Roster imported',
        message: [`Imported "${imported.name}".`, rebindNote].filter(Boolean).join(' ')
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
            onClick: () => setCreateOpen(true),
            ariaLabel: 'Create new roster'
          }}
        />
        <div className="flex flex-wrap gap-3">
          <ImportButton
            label="Import roster"
            onFilesSelected={handleImportRosterFiles}
            buttonTestId="import-roster-button"
            inputTestId="import-roster-input"
          />
        </div>
        {hasStaleRosters ? (
          <Alert
            variant="info"
            title="Existing rosters need a refresh"
            data-testid="stale-rosters-notice"
          >
            <p className="text-sm">
              They were built on 10th edition data. Open a roster and hit Refresh to bring it onto
              11th.
            </p>
          </Alert>
        ) : null}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load rosters" message={error} />
        ) : rosters.length === 0 ? (
          <RosterEmptyState
            title="No rosters yet"
            dataTestId="empty-rosters"
            action={{
              label: 'Create roster',
              onClick: () => setCreateOpen(true),
              icon: <Plus size={14} />
            }}
          />
        ) : (
          <div
            data-testid="rosters-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {rosters.map((roster) => {
              const detachments = getRosterDetachments(roster);
              return (
                <LibraryCard
                  key={roster.id}
                  name={roster.name}
                  subtitle={roster.faction?.name}
                  points={`${roster.points.current} / ${roster.points.max} pts`}
                  unitCount={roster.units.length}
                  tags={
                    detachments.length > 0
                      ? detachments.map((detachment) => (
                          <Tag
                            key={detachment.id}
                            size="sm"
                            variant="secondary"
                            className="uppercase tracking-wide"
                          >
                            {detachment.name}
                          </Tag>
                        ))
                      : undefined
                  }
                  viewPath={`/rosters/${roster.id}`}
                  editPath={`/rosters/${roster.id}/details`}
                  noun="roster"
                  onDelete={() => handleDeleteRoster(roster.id)}
                  onDuplicate={() => handleDuplicateRoster(roster)}
                  data-testid="roster-card"
                />
              );
            })}
          </div>
        )}
      </div>
      <CreateRosterSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppLayout>
  );
};

export default Rosters;
