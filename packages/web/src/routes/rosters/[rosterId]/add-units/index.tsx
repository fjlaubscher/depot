import type { FC } from 'react';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';
import useFaction from '@/hooks/use-faction';
import useFactionDatasheets from '@/hooks/use-faction-datasheets';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Alert } from '@/components/ui';
import {
  BackButton,
  DatasheetBrowser,
  DatasheetSelectionCard,
  DatasheetBrowserSkeleton,
  RosterHeader
} from '@/components/shared';
import SelectionSummary from './_components/selection-summary';
import type { SelectionGroup } from './_components/selection-summary';
import { useDocumentTitle } from '@/hooks/use-document-title';

const AddRosterUnitsView: FC = () => {
  const { state: roster, addUnit } = useRoster();
  const { state: appState } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const rosterFactionSlug = roster.faction?.slug ?? roster.factionSlug ?? undefined;
  const {
    data: factionData,
    loading: factionLoading,
    error: factionError
  } = useFaction(rosterFactionSlug);
  const {
    datasheets: factionDatasheets,
    loading: datasheetLoading,
    error: datasheetError,
    progress: datasheetProgress
  } = useFactionDatasheets(rosterFactionSlug, factionData?.datasheets);

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

  const pageTitle = roster.id ? `${roster.name} - Add Roster Units` : 'Add Roster Units';
  useDocumentTitle(pageTitle);

  if (!roster.id) {
    return <Loader />;
  }

  const factionName = roster.faction?.name;
  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName || roster.factionSlug;

  const handleAddSelectedUnits = () => {
    selectedUnits.forEach(({ datasheet, modelCost }) => {
      addUnit(datasheet, modelCost);
    });

    showToast({
      type: 'success',
      title: 'Units Added',
      message: `Added ${selectedUnits.length} unit${
        selectedUnits.length === 1 ? '' : 's'
      } to roster`
    });

    navigate(`/rosters/${roster.id}/edit`);
  };

  return (
    <div className={`flex flex-col gap-4${hasSelections ? ' pb-28 md:pb-0' : ''}`}>
      <BackButton
        to={`/rosters/${roster.id}/edit`}
        label="Back to Roster"
        ariaLabel="Back to Edit Roster"
        className="md:hidden"
      />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` },
            { label: 'Edit', path: `/rosters/${roster.id}/edit` },
            { label: 'Add Units', path: `/rosters/${roster.id}/add-units` }
          ]}
        />
      </div>

      <PageHeader
        title={roster.name}
        subtitle={subtitle}
        stats={<RosterHeader roster={roster} />}
      />

      <Alert variant="info" title="Add Units">
        Browse the datasheets below and queue units for your roster. Use the summary drawer to
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

const AddRosterUnitsPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Add Units to Roster">
      <RosterProvider rosterId={rosterId}>
        <AddRosterUnitsView />
      </RosterProvider>
    </AppLayout>
  );
};

export default AddRosterUnitsPage;
