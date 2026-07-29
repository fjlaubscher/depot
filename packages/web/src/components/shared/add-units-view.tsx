import type { FC, ReactNode } from 'react';
import { useMemo, useCallback, useEffect, useState } from 'react';
import type { depot } from '@depot/core';

import { PageHeader, Breadcrumbs, Alert } from '@/components/ui';
import BackButton from './back-button';
import { DatasheetBrowser, DatasheetSelectionCard, DatasheetBrowserSkeleton } from './datasheet';
import SelectionSummary from './selection-summary';
import type { SelectionGroup } from './selection-summary';
import useFaction from '@/hooks/use-faction';
import useFactionDatasheets from '@/hooks/use-faction-datasheets';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';

interface AddUnitsViewProps {
  factionSlug?: string;
  backTo: string;
  backLabel: string;
  backAriaLabel?: string;
  breadcrumbs: { label: string; path: string }[];
  title: string;
  subtitle?: string;
  headerStats?: ReactNode;
  /** Noun used in the info alert copy, e.g. "roster" or "collection". */
  contextLabel: string;
  onConfirm: (selectedUnits: SelectedUnit[], clearSelection: () => void) => void | Promise<void>;
}

const AddUnitsView: FC<AddUnitsViewProps> = ({
  factionSlug,
  backTo,
  backLabel,
  backAriaLabel,
  breadcrumbs,
  title,
  subtitle,
  headerStats,
  contextLabel,
  onConfirm
}) => {
  const { settings } = useSettingsContext();
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

  const showLegends = settings.showLegends ?? false;
  const showForgeWorld = settings.showForgeWorld ?? false;

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

  return (
    <div className={`flex flex-col gap-4${hasSelections ? ' pb-28 md:pb-0' : ''}`}>
      <BackButton
        to={backTo}
        label={backLabel}
        ariaLabel={backAriaLabel ?? backLabel}
        className="md:hidden"
      />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <PageHeader title={title} subtitle={subtitle} stats={headerStats} />

      <Alert variant="info" title="Add Units">
        Browse the datasheets below and queue units for your {contextLabel}. Use the summary drawer
        to review quantities before confirming your additions.
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
          onConfirm={() => void onConfirm(selectedUnits, clearSelection)}
          onIncrement={incrementUnit}
          onDecrement={decrementUnit}
          isOpen={isSummaryOpen}
          onOpenChange={setIsSummaryOpen}
        />
      </div>
    </div>
  );
};

export default AddUnitsView;
