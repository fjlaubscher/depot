import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ClipboardPlus } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { BackButton } from '@/components/shared';
import { PageHeader, Loader, Breadcrumbs, Button, Alert } from '@/components/ui';
import {
  RosterSection,
  RosterUnitCardEdit,
  RosterEmptyState,
  RosterHeader
} from '@/components/shared/roster';
import useCollection from '@/hooks/use-collection';
import { calculateCollectionPoints } from '@/utils/collection';

const CollectionPageContent: React.FC<{ collectionId?: string }> = ({ collectionId }) => {
  const navigate = useNavigate();
  const { collection, loading, error, save } = useCollection(collectionId);

  const groupedByRole = useMemo(() => {
    if (!collection) {
      return {};
    }

    return collection.items.reduce<Record<string, depot.CollectionUnit[]>>((acc, item) => {
      const role = item.datasheet.role || 'OTHER';
      acc[role] = acc[role] ? [...acc[role], item] : [item];
      return acc;
    }, {});
  }, [collection]);

  const roleKeys = useMemo(() => Object.keys(groupedByRole).sort(), [groupedByRole]);
  const points = useMemo(
    () => (collection ? calculateCollectionPoints(collection) : 0),
    [collection]
  );

  const toRosterUnit = (item: depot.CollectionUnit): depot.RosterUnit => ({
    id: item.id,
    datasheet: item.datasheet,
    modelCost: item.modelCost,
    selectedWargear: item.selectedWargear,
    selectedWargearAbilities: item.selectedWargearAbilities,
    datasheetSlug: item.datasheetSlug
  });

  const rosterLike: { points: { current: number } } = {
    points: { current: points }
  };

  const handleRemove = async (unitId: string) => {
    if (!collection) return;
    const updated = {
      ...collection,
      items: collection.items.filter((item) => item.id !== unitId)
    };
    await save(updated);
  };

  const handleDuplicate = async (unit: depot.RosterUnit) => {
    if (!collection) return;
    const source = collection.items.find((item) => item.id === unit.id);
    const duplicated: depot.CollectionUnit = source
      ? { ...source, id: crypto.randomUUID() }
      : {
          id: crypto.randomUUID(),
          datasheet: unit.datasheet,
          modelCost: unit.modelCost,
          selectedWargear: unit.selectedWargear,
          selectedWargearAbilities: unit.selectedWargearAbilities,
          datasheetSlug: unit.datasheetSlug,
          state: 'sprue'
        };

    const updated = {
      ...collection,
      items: [...collection.items, duplicated]
    };
    await save(updated);
  };

  const handleAddUnits = () => {
    if (collection) {
      navigate(`/collections/${collection.id}/add-units`);
    }
  };

  const handleCreateRoster = () => {
    if (collection) {
      navigate(`/collections/${collection.id}/new-roster`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Loader />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <Alert variant="error" title="Unable to load collection">
        {error || 'Collection not found'}
      </Alert>
    );
  }

  const subtitle = `${collection.items.length} unit${collection.items.length === 1 ? '' : 's'} - ${
    collection.faction?.name || collection.factionSlug
  }`;

  return (
    <div className="flex flex-col gap-4">
      <BackButton
        to="/collections"
        label="Collections"
        ariaLabel="Back to Collections"
        className="md:hidden"
      />

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
        subtitle={subtitle}
        stats={<RosterHeader roster={rosterLike} showEnhancements={false} />}
        action={{
          icon: <ClipboardPlus size={16} />,
          onClick: handleCreateRoster,
          ariaLabel: 'Create roster from collection'
        }}
      />

      <Button
        onClick={handleAddUnits}
        className="w-full flex items-center gap-2"
        data-testid="add-collection-units-button"
      >
        <Plus size={16} />
        Add Units
      </Button>

      {collection.items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {roleKeys.map((role) => (
            <RosterSection
              key={role}
              title={`${role.toUpperCase()} (${groupedByRole[role].length})`}
              data-testid="collection-role-section"
            >
              {groupedByRole[role].map((item) => (
                <RosterUnitCardEdit
                  key={item.id}
                  unit={toRosterUnit(item)}
                  rosterId={collection.id}
                  basePath="/collections"
                  onRemove={handleRemove}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </RosterSection>
          ))}
        </div>
      ) : (
        <RosterEmptyState
          title="No units in this collection"
          description="Add units to start tracking your pile"
          dataTestId="empty-collection-state"
        />
      )}
    </div>
  );
};

const CollectionPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();

  return (
    <AppLayout title="Collection">
      <CollectionPageContent collectionId={collectionId} />
    </AppLayout>
  );
};

export default CollectionPage;
