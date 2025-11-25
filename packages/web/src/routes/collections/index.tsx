import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import type { depot } from '@depot/core';

import { useCollections } from '@/hooks/use-collections';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import AppLayout from '@/components/layout';
import { PageHeader, Card, Button, Loader, ErrorState, Alert } from '@/components/ui';
import { offlineStorage } from '@/data/offline-storage';
import { calculateCollectionPoints } from '@/utils/collection';
import CollectionCard from './_components/collection-card';

const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { collections, loading, error, refresh } = useCollections();
  const { state } = useAppContext();
  const { showToast } = useToast();
  const usePileLabel = state.settings?.usePileOfShameLabel ?? true;
  const label = usePileLabel ? 'Pile of Shame' : 'Collections';
  const pageTitle = usePileLabel ? 'Pile of Shame Tracker' : 'Collection Tracker';

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
      const duplicated: depot.Collection = {
        ...collection,
        id: crypto.randomUUID(),
        name: `${collection.name} Copy`,
        items: collection.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
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

        <Alert variant="warning" title="Work in progress">
          This collection experience is still evolving, so expect layouts, counts, or features to
          shift as work continues. Feedback is very welcome!
        </Alert>

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
        )}
      </div>
    </AppLayout>
  );
};

export default CollectionsPage;
