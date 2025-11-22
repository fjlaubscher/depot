import type { FC } from 'react';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Alert } from '@/components/ui';
import {
  BackButton,
  DatasheetBrowser,
  DatasheetSelectionCard,
  DatasheetBrowserSkeleton,
  RosterHeader
} from '@/components/shared';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import useCollection from '@/hooks/use-collection';
import useFaction from '@/hooks/use-faction';
import useFactionDatasheets from '@/hooks/use-faction-datasheets';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';
import { calculateCollectionPoints, createCollectionUnitFromDatasheet } from '@/utils/collection';
import SelectionSummary from '@/routes/rosters/[rosterId]/add-units/_components/selection-summary';
import type { SelectionGroup } from '@/routes/rosters/[rosterId]/add-units/_components/selection-summary';

const AddCollectionUnitsView: FC<{ collectionId?: string }> = ({ collectionId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { state: appState } = useAppContext();
  const { collection, loading, error, save } = useCollection(collectionId);

  const factionSlug = collection?.faction?.slug ?? collection?.factionSlug ?? collection?.factionId;
  const {
    data: factionData,
    loading: factionLoading,
    error: factionError
  } = useFaction(factionSlug);
  const {
    datasheets: factionDatasheets,
    loading: datasheetLoading,
    error: datasheetError,
    progress: datasheetProgress
  } = useFactionDatasheets(factionSlug, factionData?.datasheets);

  const {
    selectedUnits,
    totalSelectedPoints,
    addToSelection,
    removeLatestUnit,
    getUnitCount,
    clearSelection
  } = useRosterUnitSelection();

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const aggregatedSelection = useMemo<SelectionGroup[]>(() => {
    const groups = new Map<string, SelectionGroup>();

    selectedUnits.forEach((unit) => {
      const key = `${unit.datasheet.id}-${unit.modelCost.line}`;
      const existing = groups.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, {
          count: 1,
          datasheet: unit.datasheet,
          modelCost: unit.modelCost
        });
      }
    });

    return Array.from(groups.values());
  }, [selectedUnits]);

  const incrementUnit = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      addToSelection(datasheet, modelCost);
    },
    [addToSelection]
  );

  const decrementUnit = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      removeLatestUnit(datasheet, modelCost);
    },
    [removeLatestUnit]
  );

  const showLegends = appState.settings?.showLegends ?? false;
  const showForgeWorld = appState.settings?.showForgeWorld ?? false;

  const hasSelections = selectedUnits.length > 0;

  useEffect(() => {
    if (selectedUnits.length === 0) {
      setIsSummaryOpen(false);
    }
  }, [selectedUnits.length]);

  const datasheetFilters = useMemo(
    () => ({
      showLegends,
      showForgeWorld
    }),
    [showLegends, showForgeWorld]
  );

  const rosterStats = useMemo(
    () => ({
      points: { current: collection ? calculateCollectionPoints(collection) : 0 }
    }),
    [collection]
  );

  if (loading) {
    return <Loader />;
  }

  if (error || !collection) {
    return (
      <Alert variant="error" title="Unable to load collection">
        {error || 'Collection not found'}
      </Alert>
    );
  }

  const subtitle = collection.faction?.name || collection.factionSlug || collection.factionId;

  const handleAddSelectedUnits = async () => {
    if (!collection || selectedUnits.length === 0) return;

    const newUnits = selectedUnits.map(({ datasheet, modelCost }) =>
      createCollectionUnitFromDatasheet(datasheet, modelCost)
    );
    const updated = {
      ...collection,
      items: [...collection.items, ...newUnits]
    };

    try {
      await save(updated);
      clearSelection();
      showToast({
        type: 'success',
        title: 'Units Added',
        message: `Added ${selectedUnits.length} unit${selectedUnits.length === 1 ? '' : 's'}`
      });
      navigate(`/collections/${collection.id}`);
    } catch (err) {
      console.error('Failed to add units to collection', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not add units to collection.'
      });
    }
  };

  return (
    <div className={`flex flex-col gap-4${hasSelections ? ' pb-28 md:pb-0' : ''}`}>
      <BackButton
        to={`/collections/${collection.id}`}
        label="Back to Collection"
        ariaLabel="Back to Collection"
        className="md:hidden"
      />

      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Collections', path: '/collections' },
            { label: collection.name, path: `/collections/${collection.id}` },
            { label: 'Add Units', path: `/collections/${collection.id}/add-units` }
          ]}
        />
      </div>

      <PageHeader
        title={collection.name}
        subtitle={subtitle}
        stats={<RosterHeader roster={rosterStats} showEnhancements={false} showMax={false} />}
      />

      <Alert variant="info" title="Add Units">
        Browse the datasheets below and queue units for your collection. Use the summary drawer to
        review quantities before confirming your additions.
      </Alert>

      {factionError || datasheetError ? (
        <Alert variant="error" title="Unable to load datasheets">
          {datasheetError || factionError}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        {factionLoading ? (
          <DatasheetBrowserSkeleton />
        ) : datasheetLoading ? (
          <div
            className="rounded border border-subtle bg-muted p-3"
            data-testid="datasheet-loading"
          >
            <div className="flex items-center justify-between text-sm text-subtle">
              <span>Loading datasheets</span>
              <span>
                {datasheetProgress.loaded}/{datasheetProgress.total || '.'}
              </span>
            </div>
            <div className="mt-2 h-2 rounded bg-muted">
              <div
                className="h-full rounded bg-primary-500 transition-all"
                style={{
                  width:
                    datasheetProgress.total > 0
                      ? `${Math.min(
                          100,
                          (datasheetProgress.loaded / datasheetProgress.total) * 100
                        )}%`
                      : '10%'
                }}
              />
            </div>
          </div>
        ) : (
          <DatasheetBrowser
            datasheets={factionDatasheets}
            searchPlaceholder="Search by unit name..."
            emptyStateMessage="No units available for this faction."
            filters={datasheetFilters}
            renderDatasheet={(datasheet) => (
              <DatasheetSelectionCard
                datasheet={datasheet}
                onAdd={incrementUnit}
                getUnitCount={getUnitCount}
              />
            )}
          />
        )}

        <SelectionSummary
          groups={aggregatedSelection}
          selectedUnitsCount={selectedUnits.length}
          totalPoints={totalSelectedPoints}
          onClear={clearSelection}
          onConfirm={handleAddSelectedUnits}
          onIncrement={incrementUnit}
          onDecrement={decrementUnit}
          isOpen={isSummaryOpen}
          onOpenChange={setIsSummaryOpen}
        />
      </div>
    </div>
  );
};

const AddCollectionUnitsPage: FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();

  return (
    <AppLayout title="Add Units">
      <AddCollectionUnitsView collectionId={collectionId} />
    </AppLayout>
  );
};

export default AddCollectionUnitsPage;
