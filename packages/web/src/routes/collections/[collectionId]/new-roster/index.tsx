import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardPlus } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { BackButton, DatasheetBrowser, DatasheetBrowserSkeleton } from '@/components/shared';
import { Alert, Breadcrumbs, Button, Card, Loader, PageHeader, Tag } from '@/components/ui';
import useCollection from '@/hooks/use-collection';
import { useDocumentTitle } from '@/hooks/use-document-title';
import SelectionSummary from '@/routes/rosters/[rosterId]/add-units/_components/selection-summary';
import type { SelectionGroup } from '@/routes/rosters/[rosterId]/add-units/_components/selection-summary';
import { calculateCollectionPoints, getCollectionLabels } from '@/utils/collection';
import CollectionSelectionCard from './_components/collection-selection-card';
import useSettings from '@/hooks/use-settings';

type CollectionDatasheetListItem = depot.Datasheet & {
  collectionUnitId: string;
  unit: depot.CollectionUnit;
};

const SESSION_KEY = 'collection-roster-prefill';

const CollectionNewRoster: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const usePileLabel = settings.usePileOfShameLabel ?? true;
  const labels = getCollectionLabels(usePileLabel);
  const { collection, loading, error } = useCollection(collectionId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const pageTitle = collection
    ? `${collection.name} - Build Roster`
    : `Build Roster from ${labels.singularTitle}`;
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
    () =>
      selectedUnits.map((item) => ({
        id: crypto.randomUUID(),
        datasheet: item.datasheet,
        modelCost: item.modelCost,
        selectedWargear: item.selectedWargear,
        selectedWargearAbilities: item.selectedWargearAbilities,
        datasheetSlug: item.datasheetSlug ?? item.datasheet.slug
      })),
    [selectedUnits]
  );

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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const incrementSelection = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      if (!collection) return;

      setSelectedIds((prev) => {
        const available = collection.items.find(
          (item) =>
            !prev.has(item.id) &&
            item.datasheet.id === datasheet.id &&
            item.modelCost.line === modelCost.line &&
            item.modelCost.description === modelCost.description
        );

        if (!available) return prev;

        const next = new Set(prev);
        next.add(available.id);
        return next;
      });
    },
    [collection]
  );

  const decrementSelection = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      if (!collection) return;

      setSelectedIds((prev) => {
        const matching = collection.items
          .filter(
            (item) =>
              prev.has(item.id) &&
              item.datasheet.id === datasheet.id &&
              item.modelCost.line === modelCost.line &&
              item.modelCost.description === modelCost.description
          )
          .map((item) => item.id);

        if (matching.length === 0) return prev;

        const next = new Set(prev);
        next.delete(matching[matching.length - 1]);
        return next;
      });
    },
    [collection]
  );

  const handleCreateRoster = useCallback(() => {
    if (!collection || selectedRosterUnits.length === 0) return;

    const payload = {
      collectionId: collection.id,
      factionSlug: collection.factionSlug ?? collection.factionId,
      factionId: collection.factionId,
      name: `${collection.name} roster`,
      units: selectedRosterUnits
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    navigate(`/rosters/create?fromCollection=${collection.id}`);
  }, [collection, navigate, selectedRosterUnits]);

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
        <Alert variant="error" title={`Unable to load ${labels.singular}`}>
          {error || `${labels.singularTitle} not found`}
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={pageTitle}>
      <div className={`flex flex-col gap-4${hasSelections ? ' pb-28 md:pb-0' : ''}`}>
        <BackButton
          to={`/collections/${collection.id}`}
          label={`Back to ${labels.singularTitle}`}
          className="md:hidden"
        />

        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: labels.pluralTitle, path: '/collections' },
              { label: collection.name, path: `/collections/${collection.id}` },
              { label: 'Select units', path: `/collections/${collection.id}/new-roster` }
            ]}
          />
        </div>

        <PageHeader title={`Build roster from ${labels.singular}`} subtitle={subtitle} />

        <Alert variant="info" title="Prefill a new roster">
          Select units from your {labels.singular} to prefill a roster. Use the summary drawer to
          review points before creating the roster.
        </Alert>

        {collection.items.length === 0 ? (
          <Card>
            <p className="text-sm text-subtle">No units in this {labels.singular} yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {collectionDatasheets.length === 0 ? (
              <DatasheetBrowserSkeleton />
            ) : (
              <DatasheetBrowser<CollectionDatasheetListItem>
                datasheets={collectionDatasheets}
                searchPlaceholder={`Search ${labels.singular} units...`}
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
            )}

            <SelectionSummary
              groups={aggregatedSelection}
              selectedUnitsCount={selectedUnits.length}
              totalPoints={totalSelectedPoints}
              onClear={clearSelection}
              onConfirm={handleCreateRoster}
              onIncrement={incrementSelection}
              onDecrement={decrementSelection}
              isOpen={isSummaryOpen}
              onOpenChange={setIsSummaryOpen}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollectionNewRoster;
