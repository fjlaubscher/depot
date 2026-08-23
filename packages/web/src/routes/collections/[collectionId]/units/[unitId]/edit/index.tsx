import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import {
  Card,
  Alert,
  ErrorState,
  PageHeaderSkeleton,
  SkeletonCard,
  SelectField,
  Tag
} from '@/components/ui';
import UnitEditShell from '@/components/shared/unit-edit/unit-edit-shell';
import type { UnitEditSelection } from '@/components/shared/unit-edit/unit-edit-shell';
import { COLLECTION_UNIT_STATES } from '@depot/core/utils/collection';
import { COLLECTION_STATE_META } from '@/utils/collection';
import useCollection from '@/hooks/use-collection';

const stateOptions = COLLECTION_UNIT_STATES.map((value) => ({
  value,
  label: COLLECTION_STATE_META[value].label
}));

/** Keyed by unit id by the caller, so state initialises once per unit. */
const CollectionUnitEditForm: React.FC<{
  collection: depot.Collection;
  unit: depot.CollectionUnit;
  save: (collection: depot.Collection) => Promise<void>;
}> = ({ collection, unit, save }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<depot.CollectionUnitState>(unit.state ?? 'sprue');
  const stateMeta = COLLECTION_STATE_META[state] ?? COLLECTION_STATE_META.sprue;
  const unitHash = `#collection-unit-${unit.id}`;

  const handleSave = async ({
    selectedWargear,
    selectedWargearAbilities,
    selectedModelCost
  }: UnitEditSelection) => {
    await save({
      ...collection,
      items: collection.items.map((item) =>
        item.id === unit.id
          ? {
              ...item,
              selectedWargear,
              selectedWargearAbilities,
              modelCost: selectedModelCost ?? item.modelCost,
              state
            }
          : item
      )
    });

    navigate(`/collections/${collection.id}${unitHash}`);
  };

  return (
    <UnitEditShell
      unit={unit}
      testId="edit-collection-unit-form"
      backTo={`/collections/${collection.id}${unitHash}`}
      documentTitle={`${unit.datasheet.name} - Edit Collection Unit`}
      backLabel={collection.name}
      title={unit.datasheet.name}
      subtitle={`Loadout · ${collection.name}`}
      beforeModelCost={
        <Card data-testid="unit-state-section">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-foreground">State</h3>
            <p className="text-sm text-muted">
              Track your build progress from sprue to parade-ready glory.
            </p>
            <SelectField
              label="Build state"
              options={stateOptions}
              value={state}
              onChange={(e) => setState(e.target.value as depot.CollectionUnitState)}
            />
            <Tag
              variant={stateMeta.variant}
              className="mt-3 self-start"
              data-testid="collection-unit-state-tag"
            >
              {stateMeta.label}
            </Tag>
          </div>
        </Card>
      }
      onSave={handleSave}
    />
  );
};

const CollectionUnitEditView: React.FC = () => {
  const { collectionId, unitId } = useParams<{ collectionId: string; unitId: string }>();
  const { collection, loading, error, save } = useCollection(collectionId);
  const unit = collection?.items.find((item) => item.id === unitId);

  const back = { to: `/collections/${collectionId}`, label: 'Collection' };

  if (loading) {
    return (
      <AppLayout title="Edit Collection Unit" back={back}>
        <div className="flex flex-col gap-4" data-testid="edit-collection-unit-loading">
          <PageHeaderSkeleton />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (error || !collection) {
    return (
      <AppLayout title="Edit Collection Unit" back={back}>
        <Alert variant="error" title="Unable to load collection">
          {error || 'Collection not found'}
        </Alert>
      </AppLayout>
    );
  }

  if (!unit) {
    return (
      <AppLayout title="Edit Collection Unit" back={back}>
        <ErrorState
          title="Unit Not Found"
          message="The unit you're trying to edit could not be found."
          showRetry={false}
          homeUrl={`/collections/${collectionId}`}
          data-testid="edit-collection-unit-not-found"
        />
      </AppLayout>
    );
  }

  return <CollectionUnitEditForm key={unit.id} collection={collection} unit={unit} save={save} />;
};

export default CollectionUnitEditView;
