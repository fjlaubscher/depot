import type { FC, MouseEvent } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type { depot } from '@depot/core';

import { Card, Button, QuantityStepper, Drawer } from '@/components/ui';

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
  const hasSelections = selectedUnitsCount > 0;
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileContentRef = useRef<HTMLDivElement | null>(null);
  const desktopCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const desktopContentRef = useRef<HTMLDivElement | null>(null);
  const mobileSheetTitleId = useId();
  const desktopDrawerTitleId = useId();
  const shouldRestoreFocusRef = useRef(false);

  const selectionRows = useMemo(() => {
    return groups.map(({ datasheet, modelCost, count }) => {
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
            <span className="font-medium text-blue-900 dark:text-blue-100">{datasheet.name}</span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {subtitleParts.join(' • ')}
            </span>
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
    });
  }, [groups, onDecrement, onIncrement]);

  const openSummary = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const closeSummary = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    onOpenChange(false);
  }, [onOpenChange]);

  const handleMobileOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        closeSummary();
      }
    },
    [closeSummary]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSummary();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [closeSummary, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined') {
        if (window.matchMedia('(min-width: 768px)').matches) {
          desktopCloseButtonRef.current?.focus();
        } else {
          mobileCloseButtonRef.current?.focus();
        }
      }

      if (desktopContentRef.current) {
        desktopContentRef.current.scrollTo({ top: 0 });
      }
      if (mobileContentRef.current) {
        mobileContentRef.current.scrollTo({ top: 0 });
      }
      return undefined;
    }

    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      requestAnimationFrame(() => {
        triggerButtonRef.current?.focus();
      });
    }

    return undefined;
  }, [isOpen]);

  if (!hasSelections) {
    return null;
  }

  return (
    <>
      {!isOpen ? (
        <button
          ref={triggerButtonRef}
          type="button"
          className="fixed bottom-0 left-0 right-0 z-40 flex cursor-pointer items-center justify-between gap-3 rounded-t-2xl bg-primary-500 px-4 py-4 text-white shadow-lg shadow-primary-900/30 transition hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-200 md:bottom-6 md:left-auto md:right-6 md:w-auto md:gap-2 md:rounded-full md:px-5 md:py-3 md:text-sm dark:bg-primary-600 dark:hover:bg-primary-500 dark:focus-visible:outline-primary-300"
          onClick={openSummary}
        >
          <span className="flex flex-col text-left md:flex-row md:items-center md:gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/90 md:text-sm">
              Review Selection
            </span>
            <span className="text-lg font-semibold md:text-sm">
              {selectedUnitsCount} unit{selectedUnitsCount === 1 ? '' : 's'} • {totalPoints} pts
            </span>
          </span>
          <span className="text-sm font-medium underline underline-offset-4 md:hidden">Open</span>
        </button>
      ) : null}

      <div className="hidden md:block">
        <Drawer isOpen={isOpen} onClose={closeSummary} position="right" className="w-full max-w-md">
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby={desktopDrawerTitleId}
            padding="md"
            className="flex h-full flex-col gap-4 rounded-r-none border-blue-200 bg-blue-50 shadow-xl dark:border-blue-800 dark:bg-blue-900/20"
            data-testid="unit-selection-summary"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2
                  id={desktopDrawerTitleId}
                  className="text-lg font-semibold text-blue-900 dark:text-white"
                >
                  Selection Summary
                </h2>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {selectedUnitsCount} unit{selectedUnitsCount === 1 ? '' : 's'} • {totalPoints} pts
                </p>
              </div>
              <button
                ref={desktopCloseButtonRef}
                type="button"
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:text-blue-200 dark:hover:bg-blue-900/30"
                onClick={closeSummary}
              >
                Close
              </button>
            </div>

            <div ref={desktopContentRef} className="flex-1 space-y-3 overflow-y-auto pr-2">
              {selectionRows}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total: {totalPoints} pts
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={onClear}>
                  Clear
                </Button>
                <Button size="sm" onClick={onConfirm}>
                  Confirm
                </Button>
              </div>
            </div>
          </Card>
        </Drawer>
      </div>

      <div className="md:hidden">
        {isOpen ? (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={mobileSheetTitleId}
            onClick={handleMobileOverlayClick}
          >
            <div className="mt-auto rounded-t-3xl bg-white p-4 shadow-xl dark:bg-gray-900">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center justify-between">
                <h2
                  id={mobileSheetTitleId}
                  className="text-base font-semibold text-blue-900 dark:text-white"
                >
                  Selection Summary
                </h2>
                <button
                  ref={mobileCloseButtonRef}
                  type="button"
                  className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 dark:text-blue-200 dark:hover:bg-blue-900/30"
                  onClick={closeSummary}
                >
                  Close
                </button>
              </div>

              <div
                id={`${mobileSheetTitleId}-content`}
                ref={mobileContentRef}
                className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1"
              >
                {selectionRows}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total: {totalPoints} pts
                </span>

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
          </div>
        ) : null}
      </div>
    </>
  );
};

export type { SelectionGroup };
export default SelectionSummary;
