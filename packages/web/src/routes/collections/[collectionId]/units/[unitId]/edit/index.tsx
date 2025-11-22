import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import {
  PageHeader,
  Breadcrumbs,
  Button,
  Card,
  Alert,
  ErrorState,
  PageHeaderSkeleton,
  SkeletonCard,
  SelectField,
  Tag
} from '@/components/ui';
import { BackButton, DatasheetComposition } from '@/components/shared';
import { parseLoadoutWargear } from '@/utils/wargear';
import { getWargearAbilities, normalizeSelectedWargearAbilities } from '@/utils/abilities';
import { COLLECTION_STATE_META, COLLECTION_UNIT_STATES } from '@/utils/collection';
import useCollection from '@/hooks/use-collection';
import WargearSelectionContainer from '@/routes/rosters/[rosterId]/units/[unitId]/edit/_components/wargear-selection-container';
import ModelCostSelection from '@/routes/rosters/[rosterId]/units/[unitId]/edit/_components/model-cost-selection';
import WargearAbilitiesSelection from '@/routes/rosters/[rosterId]/units/[unitId]/edit/_components/wargear-abilities-selection';

const CollectionUnitEditView: React.FC = () => {
  const { collectionId, unitId } = useParams<{ collectionId: string; unitId: string }>();
  const navigate = useNavigate();
  const { collection, loading, error, save } = useCollection(collectionId);

  const unit = collection?.items.find((item) => item.id === unitId);

  const initializedUnitRef = useRef<string | null>(null);
  const [selectedWargear, setSelectedWargear] = useState<depot.Wargear[]>([]);
  const [selectedModelCost, setSelectedModelCost] = useState<depot.ModelCost | undefined>(
    unit?.modelCost
  );
  const [selectedWargearAbilities, setSelectedWargearAbilities] = useState<depot.Ability[]>([]);
  const [state, setState] = useState<depot.CollectionUnitState>('sprue');

  useEffect(() => {
    if (unit && unitId && initializedUnitRef.current !== unitId) {
      let wargearToSelect: depot.Wargear[] = [];

      if (unit.selectedWargear && unit.selectedWargear.length > 0) {
        wargearToSelect = unit.selectedWargear;
      } else if (unit.datasheet.loadout && unit.datasheet.wargear.length > 0) {
        const matchedIds = parseLoadoutWargear(unit.datasheet.loadout, unit.datasheet.wargear);
        wargearToSelect = unit.datasheet.wargear.filter((w) => matchedIds.includes(w.id));
      }

      setSelectedWargear(wargearToSelect);
      setSelectedModelCost(unit.modelCost);
      setSelectedWargearAbilities(
        normalizeSelectedWargearAbilities(unit.selectedWargearAbilities, unit.datasheet.abilities)
      );
      setState(unit.state ?? 'sprue');

      initializedUnitRef.current = unitId;
    }
  }, [unitId, unit]);

  const shouldShowWargearOptions = useMemo(() => {
    if (!unit?.datasheet.options) return false;
    if (unit.datasheet.options.length === 0) return false;
    if (
      unit.datasheet.options.length === 1 &&
      unit.datasheet.options[0].description.toLowerCase().trim() === 'none'
    ) {
      return false;
    }
    return true;
  }, [unit?.datasheet.options]);

  const wargearAbilities = useMemo(
    () => getWargearAbilities(unit?.datasheet.abilities ?? []),
    [unit?.datasheet.abilities]
  );

  const stateMeta = COLLECTION_STATE_META[state] ?? COLLECTION_STATE_META.sprue;

  if (!collectionId) {
    return (
      <AppLayout title="Edit Collection Unit">
        <ErrorState
          title="Invalid Collection"
          message="The collection ID provided is invalid."
          data-testid="invalid-collection-error"
        />
      </AppLayout>
    );
  }

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
      <Alert variant="error" title="Unable to load collection">
        {error || 'Collection not found'}
      </Alert>
    );
  }

  if (!unit) {
    return (
      <div className="flex flex-col gap-4" data-testid="edit-collection-unit-not-found">
        <PageHeader title="Edit Collection Unit" />
        <ErrorState
          title="Unit Not Found"
          message="The unit you're trying to edit could not be found."
          showRetry={false}
          homeUrl={`/collections/${collectionId}`}
        />
      </div>
    );
  }

  const handleSave = async () => {
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

    navigate(`/collections/${collection.id}`);
  };

  const stateOptions = COLLECTION_UNIT_STATES.map((value) => ({
    value,
    label: COLLECTION_STATE_META[value].label
  }));

  return (
    <div className="flex flex-col gap-4" data-testid="edit-collection-unit-form">
      <BackButton
        to={`/collections/${collectionId}`}
        label="Back to Collection"
        testId="mobile-back-button"
        className="md:hidden"
      />

      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Collections', path: '/collections' },
            { label: collection.name, path: `/collections/${collection.id}` },
            {
              label: unit.datasheet.name,
              path: `/collections/${collection.id}/units/${unit.id}/edit`
            }
          ]}
          data-testid="edit-collection-unit-breadcrumbs"
        />
      </div>

      <PageHeader
        title="Edit Collection Unit"
        subtitle={unit.datasheet.name}
        action={{
          icon: <Save size={16} />,
          onClick: handleSave,
          ariaLabel: 'Save changes',
          testId: 'save-collection-unit-button'
        }}
        data-testid="edit-collection-unit-header"
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
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

          {unit.datasheet.modelCosts.length > 1 && (
            <Card data-testid="model-cost-section">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-foreground">Unit Size</h3>
                <p className="text-sm text-muted">Choose the number of models for this unit</p>
                <ModelCostSelection
                  unit={unit}
                  selectedModelCost={selectedModelCost || unit.modelCost}
                  onModelCostChange={setSelectedModelCost}
                />
              </div>
            </Card>
          )}

          <DatasheetComposition
            composition={unit.datasheet.unitComposition}
            loadout={unit.datasheet.loadout}
            transport={unit.datasheet.transport}
            data-testid="unit-composition"
          />

          {shouldShowWargearOptions && (
            <Alert variant="info" title="Wargear Options" data-testid="wargear-options-section">
              <ul className="space-y-2 list-disc pl-4 text-sm">
                {unit.datasheet.options.map((option, index) => (
                  <li
                    key={`${option.line}-${index}`}
                    className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-1"
                    dangerouslySetInnerHTML={{ __html: option.description }}
                    data-testid={`option-${option.line}`}
                  />
                ))}
              </ul>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card data-testid="wargear-section">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Wargear</h3>
              <p className="text-sm text-muted">Select wargear options for this unit</p>
              <WargearSelectionContainer
                unit={unit}
                selectedWargear={selectedWargear}
                onWargearChange={setSelectedWargear}
              />
            </div>
          </Card>

          {wargearAbilities.length > 0 ? (
            <Card data-testid="wargear-abilities-section">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-foreground">Wargear Abilities</h3>
                <p className="text-sm text-muted">
                  Toggle wargear-linked abilities that apply to this unit&apos;s chosen loadout.
                </p>
                <WargearAbilitiesSelection
                  abilities={wargearAbilities}
                  selected={selectedWargearAbilities}
                  onChange={setSelectedWargearAbilities}
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-4" data-testid="action-buttons">
        <Button
          variant="secondary"
          onClick={() => navigate(`/collections/${collection.id}`)}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="save-button">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const CollectionUnitEditPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();

  if (!collectionId) {
    return (
      <AppLayout title="Edit Collection Unit">
        <ErrorState
          title="Invalid Collection"
          message="The collection ID provided is invalid."
          data-testid="invalid-collection-error"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Collection Unit">
      <CollectionUnitEditView />
    </AppLayout>
  );
};

export default CollectionUnitEditPage;
