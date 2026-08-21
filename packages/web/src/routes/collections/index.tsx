import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { depot } from '@depot/core';

import { useCollections } from '@/hooks/use-collections';
import { useFactionsContext } from '@/contexts/factions/context';
import { useToast } from '@/contexts/toast/context';
import AppLayout from '@/components/layout';
import { Alert, Button, Loader, ErrorState } from '@/components/ui';
import LibraryCard from '@/components/shared/library-card';
import { RosterEmptyState } from '@/components/shared/roster';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints } from '@depot/core/utils/collection';
import { getCollectionsSnapshotCopy, getReadyPercent } from '@/utils/collection';
import {
  formatCollectionImportToast,
  importCollectionsFromFiles
} from '@/utils/import-collections';
import ImportButton from '@/components/shared/import-button';
import CollectionStateChart from './_components/collection-state-chart';
import CreateCollectionSheet from './_components/create-collection-sheet';

const CollectionsPage: React.FC = () => {
  const { collections, loading, error, refresh } = useCollections();
  const { dataVersion, getDatasheet, getFactionManifest } = useFactionsContext();
  const { showToast } = useToast();
  const snapshot = useMemo(() => getCollectionsSnapshotCopy(collections), [collections]);
  const hasSnapshotData = snapshot.items.length > 0;

  const hasStaleCollections = Boolean(
    dataVersion && collections.some((collection) => collection.dataVersion !== dataVersion)
  );

  const [createOpen, setCreateOpen] = useState(false);

  const handleDelete = async (collectionId: string) => {
    try {
      await offlineStorage.deleteCollection(collectionId);
      await refresh();
      showToast({
        type: 'success',
        title: 'Collection deleted',
        message: 'Entry deleted successfully.'
      });
    } catch (err) {
      console.error('Failed to delete collection', err);
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not delete this collection.'
      });
    }
  };

  const handleDuplicate = async (collection: depot.Collection) => {
    try {
      const currentDataVersion = dataVersion ?? null;
      const duplicated: depot.Collection = {
        ...collection,
        id: crypto.randomUUID(),
        name: `${collection.name} Copy`,
        items: collection.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
        dataVersion: currentDataVersion ?? collection.dataVersion ?? null,
        points: { current: calculateCollectionPoints(collection) }
      };

      await offlineStorage.saveCollection(duplicated);
      await refresh();

      showToast({
        type: 'success',
        title: 'Duplicated',
        message: `Created ${duplicated.name}.`
      });
    } catch (err) {
      console.error('Failed to duplicate collection', err);
      showToast({
        type: 'error',
        title: 'Duplicate failed',
        message: 'Could not duplicate this collection.'
      });
    }
  };

  const handleImportCollectionFiles = async (files: File[]) => {
    try {
      const result = await importCollectionsFromFiles(files, {
        dataVersion: dataVersion ?? null,
        getDatasheet,
        getFactionManifest,
        saveCollection: (collection) => offlineStorage.saveCollection(collection)
      });

      if (result.imported.length > 0) {
        await refresh();
      }

      showToast(formatCollectionImportToast(result));
    } catch (err) {
      console.error('Failed to import collections', err);
      showToast({
        type: 'error',
        title: 'Import failed',
        message: 'Could not import the selected files. Please try again.'
      });
    }
  };

  return (
    <AppLayout title="Collection Tracker">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          </div>
          <ImportButton
            multiple
            onFilesSelected={handleImportCollectionFiles}
            buttonTestId="import-collection-button"
            inputTestId="import-collection-input"
          />
          <Button
            onClick={() => setCreateOpen(true)}
            aria-label="Create collection"
            data-testid="create-collection-button"
          >
            <Plus size={16} />
            New
          </Button>
        </div>

        {hasStaleCollections ? (
          <Alert
            variant="info"
            title="Existing collections need a refresh"
            data-testid="stale-collections-notice"
          >
            <p className="text-sm">
              They were built on 10th edition data. Open a collection and hit Refresh to bring it
              onto 11th.
            </p>
          </Alert>
        ) : null}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load collections" message={error} />
        ) : collections.length === 0 ? (
          <RosterEmptyState
            title="No collections yet"
            dataTestId="empty-collections"
            action={{
              label: 'Create collection',
              onClick: () => setCreateOpen(true),
              icon: <Plus size={14} />
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {hasSnapshotData ? (
              <CollectionStateChart items={snapshot.items} heading={snapshot.heading} />
            ) : null}

            <div
              data-testid="collections-grid"
              className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {collections.map((collection) => {
                const ready = getReadyPercent(collection.items);
                return (
                  <LibraryCard
                    key={collection.id}
                    name={collection.name}
                    meta={[
                      collection.faction?.name || collection.factionSlug || collection.factionId,
                      `${collection.items.length} ${collection.items.length === 1 ? 'unit' : 'units'}`
                    ].join(' · ')}
                    points={calculateCollectionPoints(collection)}
                    pointsCaption="PTS"
                    content={
                      <div>
                        <div className="h-1 overflow-hidden rounded-xs bg-surface-soft">
                          <div className="h-full bg-success-fg" style={{ width: `${ready}%` }} />
                        </div>
                        <div className="mt-1 font-mono text-[9px] font-medium text-success-fg">
                          {ready}% ready
                        </div>
                      </div>
                    }
                    viewPath={`/collections/${collection.id}`}
                    editPath={`/collections/${collection.id}`}
                    noun="collection"
                    onDelete={() => handleDelete(collection.id)}
                    onDuplicate={() => handleDuplicate(collection)}
                    data-testid={`collection-card-${collection.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      <CreateCollectionSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppLayout>
  );
};

export default CollectionsPage;
