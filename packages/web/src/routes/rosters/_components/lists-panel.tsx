import React, { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import useRosters from '@/hooks/use-rosters';
import { useCollections } from '@/hooks/use-collections';
import { useToast } from '@/contexts/toast/context';
import { useFactionsContext } from '@/contexts/factions/context';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { readJsonFile } from '@/utils/file';
import { isExportedRoster } from '@/types/export';
import { formatRebindSummaryMessage, refreshRosterDataWithReport } from '@/utils/refresh-user-data';
import { getRosterDetachments, remapRosterIds } from '@depot/core/utils/roster';
import { validateRoster } from '@depot/core/utils/roster-legality';

import { Alert, Button, Loader, ErrorState } from '@/components/ui';
import ImportButton from '@/components/shared/import-button';
import LibraryCard from '@/components/shared/library-card';
import { RosterEmptyState } from '@/components/shared/roster';
import CreateRosterSheet from './create-roster-sheet';

type Slots = { toolbar: ReactNode; body: ReactNode };

interface Props {
  children?: (slots: Slots) => ReactNode;
}

const ListsPanel: React.FC<Props> = ({ children }) => {
  const { t } = useTranslation('rosters');
  const { rosters, loading, error, deleteRoster, duplicateRoster, refresh } = useRosters();
  const { collections } = useCollections();
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
        title: t('notifications.deleted'),
        message: t('notifications.deletedMessage')
      });
    } catch (error) {
      console.error('Failed to delete roster:', error);
      showToast({
        type: 'error',
        title: t('notifications.deleteFailed'),
        message: t('notifications.deleteError')
      });
    }
  };

  const handleDuplicateRoster = async (roster: depot.Roster) => {
    try {
      const duplicated = await duplicateRoster(roster, dataVersion ?? roster.dataVersion);
      showToast({
        type: 'success',
        title: t('notifications.duplicated'),
        message: t('notifications.duplicatedMessage', { name: duplicated.name })
      });
    } catch (error) {
      console.error('Failed to duplicate roster:', error);
      showToast({
        type: 'error',
        title: t('notifications.duplicateFailed'),
        message: t('notifications.duplicateError')
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
          title: t('notifications.importFailed'),
          message: t('notifications.invalidImport')
        });
        return;
      }

      let imported = remapRosterIds(parsed.roster);
      let rebindNote: string | null = null;
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
        title: t('notifications.imported'),
        message: [t('notifications.importedMessage', { name: imported.name }), rebindNote]
          .filter(Boolean)
          .join(' ')
      });
    } catch (err) {
      console.error('Failed to import roster', err);
      showToast({
        type: 'error',
        title: t('notifications.importFailed'),
        message: t('notifications.importError')
      });
    }
  };

  const toolbar = (
    <>
      <ImportButton
        onFilesSelected={handleImportRosterFiles}
        buttonTestId="import-roster-button"
        inputTestId="import-roster-input"
      />
      <Button onClick={() => setCreateOpen(true)} aria-label={t('pages.createNew')}>
        <Plus size={16} />
        {t('pages.new')}
      </Button>
    </>
  );

  const body = (
    <div className="flex flex-col gap-4">
      {hasStaleRosters ? (
        <Alert variant="info" title={t('pages.staleLists')} data-testid="stale-rosters-notice">
          <p className="text-sm">{t('pages.staleListsMessage')}</p>
        </Alert>
      ) : null}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : error ? (
        <ErrorState title={t('pages.loadFailed')} message={t('pages.loadError')} />
      ) : rosters.length === 0 ? (
        <RosterEmptyState
          title={t('pages.empty')}
          dataTestId="empty-rosters"
          action={{
            label: t('pages.createAction'),
            onClick: () => setCreateOpen(true),
            icon: <Plus size={14} />
          }}
        />
      ) : (
        <div
          data-testid="rosters-grid"
          className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {rosters.map((roster) => {
            const detachments = getRosterDetachments(roster);
            const invalid = validateRoster(roster).length > 0;
            const collectionName = roster.collectionId
              ? collections.find((collection) => collection.id === roster.collectionId)?.name
              : undefined;
            return (
              <LibraryCard
                key={roster.id}
                name={roster.name}
                meta={[
                  roster.faction?.name,
                  collectionName,
                  detachments.map((d) => d.name).join(', '),
                  t('units.count', { count: roster.units.length })
                ]
                  .filter(Boolean)
                  .join(' · ')}
                points={
                  <span
                    className={
                      roster.points.current > roster.points.max ? 'text-danger-fg' : undefined
                    }
                  >
                    {roster.points.current}
                    <span className="text-subtle">/{roster.points.max}</span>
                  </span>
                }
                pointsCaption={t(invalid ? 'units.invalidCaption' : 'units.pointsCaption')}
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
      <CreateRosterSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );

  if (children) {
    return <>{children({ toolbar, body })}</>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">{toolbar}</div>
      {body}
    </div>
  );
};

export default ListsPanel;
