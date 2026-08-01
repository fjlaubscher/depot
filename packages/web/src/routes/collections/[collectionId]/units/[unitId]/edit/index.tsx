import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import {
  PageHeader,
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
import { COLLECTION_STATE_META, COLLECTION_LABELS } from '@/utils/collection';
import useCollection from '@/hooks/use-collection';
import { useDocumentTitle } from '@/hooks/use-document-title';

const CollectionUnitEditView: React.FC = () => {
  const { collectionId, unitId } = useParams<{ collectionId: string; unitId: string }>();
  const navigate = useNavigate();
  const { collection, loading, error, save } = useCollection(collectionId);
  const labels = COLLECTION_LABELS;

  const unit = collection?.items.find((item) => item.id === unitId);

  // Track which unit we've initialized to avoid resetting user selections
  const initializedUnitRef = useRef<string | null>(null);
  const [state, setState] = useState<depot.CollectionUnitState>('sprue');

  useEffect(() => {
    if (unit && unitId && initializedUnitRef.current !== unitId) {
      setState(unit.state ?? 'sprue');

      initializedUnitRef.current = unitId;
    }
  }, [unitId, unit]);

  const stateMeta = COLLECTION_STATE_META[state] ?? COLLECTION_STATE_META.sprue;

  const pageTitle = collection?.name
    ? `${collection.name} - Edit ${labels.singularTitle} Unit`
    : `Edit ${labels.singularTitle} Unit`;

  useDocumentTitle(pageTitle);

  if (loading) {
    return (
      <div className="flex flex-col gap-4" data-testid="edit-collection-unit-loading">
        <PageHeaderSkeleton />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <Alert variant="error" title={`Unable to load ${labels.singular}`}>
        {error || `${labels.singularTitle} not found`}
      </Alert>
    );
  }

  if (!unit) {
    return (
      <div className="flex flex-col gap-4" data-testid="edit-collection-unit-not-found">
        <PageHeader title={`Edit ${labels.singularTitle} Unit`} />
        <ErrorState
          title="Unit Not Found"
          message="The unit you're trying to edit could not be found."
          showRetry={false}
          homeUrl={`/collections/${collectionId}`}
        />
      </div>
    );
  }

  const unitHash = unit ? `#collection-unit-${unit.id}` : '';

  const handleSave = async ({
    selectedWargear,
    selectedWargearAbilities,
    selectedModelCost
  }: UnitEditSelection) => {
    if (!collection || !unitId) return;

    const updatedItems = collection.items.map((item) =>
      item.id === unitId
        ? {
            ...item,
            selectedWargear,
            selectedWargearAbilities,
            modelCost: selectedModelCost ?? item.modelCost,
            state
          }
        : item
    );

    await save({
      ...collection,
      items: updatedItems
    });

    navigate(`/collections/${collection.id}${unitHash}`);
  };

  const stateOptions = COLLECTION_UNIT_STATES.map((value) => ({
    value,
    label: COLLECTION_STATE_META[value].label
  }));

  return (
    <UnitEditShell
      unit={unit}
      unitId={unitId}
      testId="edit-collection-unit-form"
      backTo={`/collections/${collectionId}${unitHash}`}
      backLabel={`Back to ${labels.singularTitle}`}
      breadcrumbs={[
        { label: labels.pluralTitle, path: '/collections' },
        { label: collection.name, path: `/collections/${collection.id}${unitHash}` },
        {
          label: unit.datasheet.name,
          path: `/collections/${collection.id}/units/${unit.id}/edit`
        }
      ]}
      breadcrumbsTestId="edit-collection-unit-breadcrumbs"
      title={`Edit ${labels.singularTitle} Unit`}
      subtitle={unit.datasheet.name}
      headerTestId="edit-collection-unit-header"
      saveButtonTestId="save-collection-unit-button"
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

const CollectionUnitEditPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const labels = COLLECTION_LABELS;

  if (!collectionId) {
    return (
      <AppLayout title={`Edit ${labels.singularTitle} Unit`}>
        <ErrorState
          title={`Invalid ${labels.singularTitle}`}
          message={`The ${labels.singular} ID provided is invalid.`}
          data-testid="invalid-collection-error"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Edit ${labels.singularTitle} Unit`}>
      <CollectionUnitEditView />
    </AppLayout>
  );
};

export default CollectionUnitEditPage;
