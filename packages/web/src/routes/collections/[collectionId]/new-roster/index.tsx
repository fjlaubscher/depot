import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { BackButton, DatasheetBrowser } from '@/components/shared';
import { Alert, Breadcrumbs, Loader, PageHeader } from '@/components/ui';
import { RosterEmptyState } from '@/components/shared/roster';
import useCollection from '@/hooks/use-collection';
import { useDocumentTitle } from '@/hooks/use-document-title';
import SelectionSummary from '@/components/shared/selection-summary';
import type { SelectionGroup } from '@/components/shared/selection-summary';
import { calculateCollectionPoints } from '@depot/core/utils/collection';
import { groupBy } from '@depot/core/utils/common';
import CollectionSelectionCard from './_components/collection-selection-card';
import { useSettingsContext } from '@/contexts/settings/context';
import CreateRosterSheet from '@/routes/rosters/_components/create-roster-sheet';

type CollectionDatasheetListItem = depot.Datasheet & {
  collectionUnitId: string;
  unit: depot.CollectionUnit;
};

const CollectionNewRoster: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettingsContext();
  const { collection, loading, error } = useCollection(collectionId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const pageTitle = collection
    ? `${collection.name} - Build Roster`
    : 'Build Roster from Collection';
  useDocumentTitle(pageTitle);

  useEffect(() => {
    if (selectedIds.size === 0) {
      setIsSummaryOpen(false);
    }
  }, [selectedIds.size]);

  const collectionDatasheets = useMemo<CollectionDatasheetListItem[]>(() => {
    if (!collection) return [];

    return collection.items.map((item) => ({
      ...item.datasheet,
      slug: `${item.datasheet.slug}-${item.id}`,
      collectionUnitId: item.id,
      unit: item
    }));
  }, [collection]);

  const selectedUnits = useMemo(
    () => collection?.items.filter((item) => selectedIds.has(item.id)) ?? [],
    [collection, selectedIds]
  );

  const selectedRosterUnits: depot.RosterUnit[] = useMemo(
    () => selectedUnits.map((item) => ({ ...item, id: crypto.randomUUID() })),
    [selectedUnits]
  );

  const aggregatedSelection = useMemo<SelectionGroup[]>(
    () =>
      Array.from(
        groupBy(selectedUnits, (unit) => `${unit.datasheet.id}-${unit.modelCost.line}`).values(),
        (group) => ({
          count: group.length,
          datasheet: group[0].datasheet,
          modelCost: group[0].modelCost
        })
      ),
    [selectedUnits]
  );

  const totalSelectedPoints = useMemo(
    () =>
      selectedUnits.reduce(
        (total: number, unit) => total + (parseInt(unit.modelCost.cost, 10) || 0),
        0
      ),
    [selectedUnits]
  );

  const points = collection ? calculateCollectionPoints(collection) : 0;
  const selectedCount = selectedIds.size;
  const hasSelections = selectedCount > 0;

  const datasheetFilters = useMemo(
    () => ({
      showLegends: settings.showLegends ?? false,
      showForgeWorld: settings.showForgeWorld ?? false
    }),
    [settings.showLegends, settings.showForgeWorld]
  );

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  /** Select the next unselected matching unit (+1) or deselect the last selected one (-1). */
  const adjust = (datasheet: depot.Datasheet, modelCost: depot.ModelCost, delta: 1 | -1) =>
    setSelectedIds((prev) => {
      const candidates = (collection?.items ?? []).filter(
        (item) =>
          prev.has(item.id) === delta < 0 &&
          item.datasheet.id === datasheet.id &&
          item.modelCost.line === modelCost.line &&
          item.modelCost.description === modelCost.description
      );
      const target = delta > 0 ? candidates[0] : candidates.at(-1);
      if (!target) return prev;
      const next = new Set(prev);
      if (delta > 0) next.add(target.id);
      else next.delete(target.id);
      return next;
    });

  const handleCreateRoster = () => {
    if (!collection || selectedRosterUnits.length === 0) return;
    setIsSummaryOpen(false);
    setIsCreateOpen(true);
  };

  const subtitle = collection
    ? `${collection.items.length} units - ${
        collection.faction?.name || collection.factionSlug || collection.factionId
      }`
    : undefined;

  if (loading) {
    return (
      <AppLayout title={pageTitle}>
        <div className="flex flex-col gap-4">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (error || !collection) {
    return (
      <AppLayout title={pageTitle}>
        <Alert variant="error" title="Unable to load collection">
          {error || 'Collection not found'}
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={pageTitle}>
      <div className={`flex flex-col gap-4${hasSelections ? ' pb-28 md:pb-0' : ''}`}>
        <BackButton
          to={`/collections/${collection.id}`}
          label="Back to Collection"
          className="md:hidden"
        />

        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Collections', path: '/collections' },
              { label: collection.name, path: `/collections/${collection.id}` },
              { label: 'Select units', path: `/collections/${collection.id}/new-roster` }
            ]}
          />
        </div>

        <PageHeader title="Build roster from collection" subtitle={subtitle} />

        {collection.items.length === 0 ? (
          <RosterEmptyState
            title="No units in this collection"
            dataTestId="empty-collection-state"
            action={{
              label: 'Add units',
              onClick: () => navigate(`/collections/${collection.id}/add-units`),
              icon: <Plus size={14} />
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <DatasheetBrowser<CollectionDatasheetListItem>
              datasheets={collectionDatasheets}
              searchPlaceholder="Search collection units..."
              emptyStateMessage="No units match your filters."
              filters={datasheetFilters}
              showItemCount={false}
              renderDatasheet={(datasheet) => (
                <CollectionSelectionCard
                  unit={datasheet.unit}
                  selected={selectedIds.has(datasheet.collectionUnitId)}
                  onToggle={toggleSelect}
                />
              )}
            />

            <SelectionSummary
              groups={aggregatedSelection}
              selectedUnitsCount={selectedUnits.length}
              totalPoints={totalSelectedPoints}
              onClear={() => setSelectedIds(new Set())}
              onConfirm={handleCreateRoster}
              onIncrement={(datasheet, modelCost) => adjust(datasheet, modelCost, 1)}
              onDecrement={(datasheet, modelCost) => adjust(datasheet, modelCost, -1)}
              isOpen={isSummaryOpen}
              onOpenChange={setIsSummaryOpen}
            />
          </div>
        )}
      </div>
      <CreateRosterSheet
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        prefill={{
          name: `${collection.name} roster`,
          factionSlug: collection.factionSlug ?? collection.factionId,
          units: selectedRosterUnits
        }}
      />
    </AppLayout>
  );
};

export default CollectionNewRoster;
