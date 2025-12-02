import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import type { depot } from '@depot/core';

import { useCollections } from '@/hooks/use-collections';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import AppLayout from '@/components/layout';
import { PageHeader, Card, Button, Loader, ErrorState } from '@/components/ui';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints, getCollectionsSnapshotCopy } from '@/utils/collection';
import { readJsonFile } from '@/utils/file';
import { isExportedCollection } from '@/types/export';
import ImportButton from '@/components/shared/import-button';
import CollectionCard from './_components/collection-card';
import CollectionStateChart from './_components/collection-state-chart';

const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { collections, loading, error, refresh } = useCollections();
  const { state } = useAppContext();
  const { showToast } = useToast();
  const usePileLabel = state.settings?.usePileOfShameLabel ?? true;
  const label = usePileLabel ? 'Pile of Shame' : 'Collections';
  const pageTitle = usePileLabel ? 'Pile of Shame Tracker' : 'Collection Tracker';
  const snapshot = useMemo(
    () => getCollectionsSnapshotCopy(collections, usePileLabel),
    [collections, usePileLabel]
  );

  const handleCreate = () => navigate('/collections/create');

  const handleDelete = async (collectionId: string) => {
    try {
      await offlineStorage.deleteCollection(collectionId);
      await refresh();
      showToast({
        type: 'success',
        title: usePileLabel ? 'Pile entry removed' : 'Collection deleted',
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
      const currentDataVersion = state.dataVersion ?? null;
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

  const remapCollectionIds = (collection: depot.Collection): depot.Collection => {
    const currentDataVersion = state.dataVersion ?? null;
    const items = collection.items.map((item) => ({
      ...item,
      id: crypto.randomUUID()
    }));

    const imported: depot.Collection = {
      ...collection,
      id: crypto.randomUUID(),
      items,
      dataVersion: currentDataVersion ?? collection.dataVersion ?? null,
      points: { current: calculateCollectionPoints({ ...collection, items }) }
    };

    return imported;
  };

  const handleImportCollectionFile = async (file: File) => {
    try {
      const parsed = await readJsonFile<unknown>(file);
      if (!isExportedCollection(parsed) || parsed.version !== 1) {
        showToast({
          type: 'error',
          title: 'Import failed',
          message: 'This file does not look like a depot collection export.'
        });
        return;
      }

      const imported = remapCollectionIds(parsed.collection);
      await offlineStorage.saveCollection(imported);
      await refresh();

      showToast({
        type: 'success',
        title: usePileLabel ? 'Pile entry imported' : 'Collection imported',
        message: `Imported "${imported.name}".`
      });
    } catch (err) {
      console.error('Failed to import collection', err);
      showToast({
        type: 'error',
        title: 'Import failed',
        message: 'Could not import this collection. Please check the file and try again.'
      });
    }
  };

  return (
    <AppLayout title={pageTitle}>
      <div className="flex flex-col gap-4">
        <PageHeader
          title={label}
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
            label="Import collection"
            onFileSelected={handleImportCollectionFile}
            buttonTestId="import-collection-button"
            inputTestId="import-collection-input"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load collections" message={error} />
        ) : collections.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-10">
            <FolderOpen className="h-8 w-8 text-muted" />
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">Nothing here yet</p>
              <p className="text-sm text-subtle">
                Start your {usePileLabel ? 'pile' : 'collection'} by adding a faction.
              </p>
            </div>
            <Button onClick={() => navigate('/collections/create')}>Create</Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            <CollectionStateChart
              items={snapshot.items}
              heading={snapshot.heading}
              subheading={snapshot.subheading}
            />

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
