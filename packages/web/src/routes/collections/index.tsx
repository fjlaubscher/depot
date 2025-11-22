import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useCollections } from '@/hooks/use-collections';
import { useAppContext } from '@/contexts/app/use-app-context';
import AppLayout from '@/components/layout';
import { PageHeader, Card, Button, Loader, Tag } from '@/components/ui';
import { calculateCollectionPoints } from '@/utils/collection';

const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { collections, loading, error } = useCollections();
  const { state } = useAppContext();
  const usePileLabel = state.settings?.usePileOfShameLabel ?? true;
  const label = usePileLabel ? 'Pile of Shame' : 'Collections';

  return (
    <AppLayout title={label}>
      <div className="flex flex-col gap-4">
        <PageHeader
          title={label}
          subtitle="Track your kits, set their state, and prep them for roster building."
          action={{
            icon: <Plus size={16} />,
            onClick: () => navigate('/collections/create'),
            ariaLabel: 'Create collection',
            testId: 'create-collection-button'
          }}
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-danger-600 dark:text-danger-300" data-testid="collections-error">
              {error}
            </p>
          </Card>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => {
              const points = calculateCollectionPoints(collection);
              return (
                <Card
                  key={collection.id}
                  padding="lg"
                  className="flex flex-col gap-3 cursor-pointer hover:border-primary-200 dark:hover:border-primary-700 transition-colors"
                  onClick={() => navigate(`/collections/${collection.id}`)}
                  data-testid={`collection-card-${collection.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-foreground">{collection.name}</h3>
                      <p className="text-sm text-subtle capitalize">
                        {collection.faction?.name || collection.factionSlug || collection.factionId}
                      </p>
                    </div>
                    <Tag variant="secondary" size="sm">
                      {collection.items.length} unit{collection.items.length === 1 ? '' : 's'}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between text-sm text-subtle">
                    <span>Points</span>
                    <span className="font-semibold text-foreground">{points}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollectionsPage;
