import type { FC } from 'react';
import type { depot } from '@depot/core';

import { Button, QuantityStepper, Drawer } from '@/components/ui';
import useMediaQuery from '@/hooks/use-media-query';

interface SelectionGroup {
  count: number;
  datasheet: depot.Datasheet;
  modelCost: depot.ModelCost;
}

interface SelectionSummaryProps {
  groups: SelectionGroup[];
  selectedUnitsCount: number;
  totalPoints: number;
  onClear: () => void;
  onConfirm: () => void;
  onIncrement: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  onDecrement: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Floating "Review Selection" trigger + native-dialog drawer listing the picked units. */
const SelectionSummary: FC<SelectionSummaryProps> = ({
  groups,
  selectedUnitsCount,
  totalPoints,
  onClear,
  onConfirm,
  onIncrement,
  onDecrement,
  isOpen,
  onOpenChange
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (selectedUnitsCount === 0) {
    return null;
  }

  const summary = `${selectedUnitsCount} unit${selectedUnitsCount === 1 ? '' : 's'} • ${totalPoints} pts`;

  return (
    <>
      {/* Stays mounted while the dialog is open so the native <dialog> can restore focus to it on close. */}
      <button
        type="button"
        className="fixed bottom-0 left-0 right-0 z-40 flex cursor-pointer items-center justify-between gap-3 rounded-t-lg border-t border-border-subtle bg-surface-base px-4 py-4 text-body shadow-e2 transition hover:bg-surface-soft focus-ring-primary md:bottom-6 md:left-auto md:right-6 md:w-auto md:gap-2 md:rounded-sm md:border md:px-5 md:py-3 md:text-sm md:shadow-e2"
        onClick={() => onOpenChange(true)}
      >
        <span className="flex flex-col text-left md:flex-row md:items-center md:gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted md:text-sm">
            Review Selection
          </span>
          <span className="text-lg font-semibold text-foreground md:text-sm">{summary}</span>
        </span>
        <span className="text-sm font-medium text-muted underline underline-offset-4 md:hidden">
          Review
        </span>
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={() => onOpenChange(false)}
        position={isDesktop ? 'right' : 'bottom'}
        className={isDesktop ? 'surface-card shadow-xl' : undefined}
      >
        <div
          className="flex h-full min-h-0 flex-col gap-4 p-4"
          data-testid="unit-selection-summary"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-foreground">Selection Summary</h2>
              <p className="text-sm text-info-fg">{summary}</p>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-sm px-3 min-h-11 text-sm font-medium text-info-fg transition hover:bg-info-surface focus-ring-info"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
            {groups.map(({ datasheet, modelCost, count }) => {
              const subtitleParts = [`${modelCost.cost} pts`];
              if (modelCost.description && modelCost.description !== datasheet.name) {
                subtitleParts.push(modelCost.description);
              }

              return (
                <div
                  key={`${datasheet.id}-${modelCost.line}`}
                  data-testid={`selection-item-${datasheet.id}-${modelCost.line}`}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-info-fg">{datasheet.name}</span>
                    <span className="text-sm text-info-fg">{subtitleParts.join(' • ')}</span>
                  </div>
                  <QuantityStepper
                    size="sm"
                    value={count}
                    onDecrease={() => onDecrement(datasheet, modelCost)}
                    onIncrease={() => onIncrement(datasheet, modelCost)}
                    decreaseLabel={`Decrease ${datasheet.name}`}
                    increaseLabel={`Increase ${datasheet.name}`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-info-fg">Total: {totalPoints} pts</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={onClear}>
                Clear
              </Button>
              <Button size="sm" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export type { SelectionGroup };
export default SelectionSummary;
