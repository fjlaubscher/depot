import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { Breadcrumbs, Button, Card, Loader, PageHeader, Tag } from '@/components/ui';
import { BackButton } from '@/components/shared';
import { RosterSection, RosterUnitCardCompact } from '@/components/shared/roster';
import useCollection from '@/hooks/use-collection';
import { calculateCollectionPoints } from '@/utils/collection';

const CollectionViewPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { collection, loading, error } = useCollection(collectionId);

  if (!collectionId) {
    return (
      <AppLayout title="Collection">
        <Card>
          <p className="text-sm text-danger-600">Invalid collection id.</p>
        </Card>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Collection">
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (!collection || error) {
    return (
      <AppLayout title="Collection">
        <Card>
          <p className="text-sm text-danger-600">Unable to load collection.</p>
        </Card>
      </AppLayout>
    );
  }

  const grouped = useMemo(() => {
    return collection.items.reduce<Record<string, depot.CollectionUnit[]>>((acc, item) => {
      const role = item.datasheet.role || 'OTHER';
      acc[role] = acc[role] ? [...acc[role], item] : [item];
      return acc;
    }, {});
  }, [collection.items]);

  const points = calculateCollectionPoints(collection);
  const roleKeys = Object.keys(grouped).sort();

  const toRosterUnit = (item: depot.CollectionUnit): depot.RosterUnit => ({
    id: item.id,
    datasheet: item.datasheet,
    modelCost: item.modelCost,
    selectedWargear: item.selectedWargear,
    selectedWargearAbilities: item.selectedWargearAbilities,
    datasheetSlug: item.datasheetSlug
  });

  return (
    <AppLayout title={collection.name}>
      <div className="flex flex-col gap-4">
        <BackButton to="/collections" label="Collections" className="md:hidden" />

        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Collections', path: '/collections' },
              { label: collection.name, path: `/collections/${collection.id}` }
            ]}
          />
        </div>

        <PageHeader
          title={collection.name}
          subtitle={`${collection.items.length} unit${collection.items.length === 1 ? '' : 's'} · ${
            collection.faction?.name || collection.factionSlug
          } · ${points} pts`}
          action={{
            icon: <Pencil size={16} />,
            label: 'Edit Collection',
            onClick: () => navigate(`/collections/${collection.id}/edit`),
            testId: 'edit-collection-button'
          }}
        />

        {collection.items.length === 0 ? (
          <Card>
            <p className="text-sm text-subtle">No units in this collection yet.</p>
            <Button className="mt-3" onClick={() => navigate(`/collections/${collection.id}/edit`)}>
              Add Units
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {roleKeys.map((role) => (
              <RosterSection
                key={role}
                title={`${role.toUpperCase()} (${grouped[role].length})`}
                data-testid="collection-role-section"
              >
                {grouped[role].map((item) => (
                  <RosterUnitCardCompact key={item.id} unit={toRosterUnit(item)}>
                    <Card.Content className="flex items-center gap-2">
                      <Tag size="sm" variant="secondary" className="capitalize">
                        {item.state}
                      </Tag>
                    </Card.Content>
                  </RosterUnitCardCompact>
                ))}
              </RosterSection>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollectionViewPage;
