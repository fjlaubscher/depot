import type { FC, ReactNode } from 'react';
import { useMemo, useEffect, useState } from 'react';

import { PageHeader, Breadcrumbs, Alert } from '@/components/ui';
import BackButton from './back-button';
import { DatasheetBrowser, DatasheetSelectionCard, DatasheetBrowserSkeleton } from './datasheet';
import SelectionSummary from './selection-summary';
import type { SelectionGroup } from './selection-summary';
import useFaction from '@/hooks/use-faction';
import useFactionDatasheets from '@/hooks/use-faction-datasheets';
import { useRosterUnitSelection } from '@/hooks/use-roster-unit-selection';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';
import { useSettingsContext } from '@/contexts/settings/context';
import { groupBy } from '@depot/core/utils/common';

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
            className="rounded-sm border border-border-subtle bg-muted p-3"
            data-testid="datasheet-loading"
          >
            <div className="flex items-center justify-between text-sm text-subtle">
              <span>Loading datasheets</span>
              <span>
                {datasheetProgress.loaded}/{datasheetProgress.total || '.'}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-sm bg-muted">
              <div
                className="h-full rounded-sm bg-accent-500 transition-all"
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
                onAdd={addToSelection}
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
          onIncrement={addToSelection}
          onDecrement={removeLatestUnit}
          isOpen={isSummaryOpen}
          onOpenChange={setIsSummaryOpen}
        />
      </div>
    </div>
  );
};

export default AddUnitsView;
