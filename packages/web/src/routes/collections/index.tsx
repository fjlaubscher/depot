import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { depot } from '@depot/core';

import { useCollections } from '@/hooks/use-collections';
import { useFactionsContext } from '@/contexts/factions/context';
import { useToast } from '@/contexts/toast/use-toast-context';
import AppLayout from '@/components/layout';
import { Alert, PageHeader, Loader, ErrorState } from '@/components/ui';
import { ListEmptyState } from '@/components/shared';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints } from '@depot/core/utils/collection';
import { getCollectionsSnapshotCopy } from '@/utils/collection';
import {
  formatCollectionImportToast,
  importCollectionsFromFiles
} from '@/utils/import-collections';
import ImportButton from '@/components/shared/import-button';
import CollectionCard from './_components/collection-card';
import CollectionStateChart from './_components/collection-state-chart';

const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { collections, loading, error, refresh } = useCollections();
  const { dataVersion, getDatasheet, getFactionManifest } = useFactionsContext();
  const { showToast } = useToast();
  const snapshot = useMemo(() => getCollectionsSnapshotCopy(collections), [collections]);
  const hasSnapshotData = snapshot.items.length > 0;

  const hasStaleCollections = Boolean(
    dataVersion && collections.some((collection) => collection.dataVersion !== dataVersion)
  );

  const handleCreate = () => navigate('/collections/create');

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
        <PageHeader
          title="Collections"
          subtitle="Track your kits, set their state, and prep them for roster building."
          action={{
            icon: <Plus size={16} />,
            onClick: handleCreate,
            ariaLabel: 'Create collection',
            testId: 'create-collection-button'
          }}
        />
        <div className="flex flex-wrap gap-3">
          <ImportButton
            multiple
            onFilesSelected={handleImportCollectionFiles}
            buttonTestId="import-collection-button"
            inputTestId="import-collection-input"
          />
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
          <ListEmptyState
            title="Nothing here yet"
            actionLabel="Create"
            onAction={() => navigate('/collections/create')}
            testId="empty-collections"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {hasSnapshotData ? (
              <CollectionStateChart
                items={snapshot.items}
                heading={snapshot.heading}
                subheading={snapshot.subheading}
              />
            ) : null}

            <div
              data-testid="collections-grid"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollectionsPage;
