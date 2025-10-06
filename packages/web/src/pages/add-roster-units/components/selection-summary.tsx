import type { FC } from 'react';
import { useMemo } from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';

import { Card, Button, QuantityStepper } from '@/components/ui';

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
  isExpanded: boolean;
  className?: string;
  onRequestExpand?: () => void;
}

const SelectionSummary: FC<SelectionSummaryProps> = ({
  groups,
  selectedUnitsCount,
  totalPoints,
  onClear,
  onConfirm,
  onIncrement,
  onDecrement,
  isExpanded,
  className,
  onRequestExpand
}) => {
  const hasSelections = selectedUnitsCount > 0;

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

  if (!hasSelections) {
    return null;
  }

  return (
    <div
      className={classNames(
        'z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-shadow',
        isExpanded ? 'pb-3' : 'py-3 sticky top-0 shadow-sm',
        className
      )}
    >
      <Card
        padding="sm"
        className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
        data-testid="unit-selection-summary"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {selectedUnitsCount} unit{selectedUnitsCount === 1 ? '' : 's'} selected
            </p>
            <button
              type="button"
              onClick={() => {
                if (!isExpanded) {
                  onRequestExpand?.();
                }
              }}
              className={classNames(
                'text-sm text-blue-700 dark:text-blue-300 text-left underline-offset-2',
                !isExpanded
                  ? 'underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400'
                  : ''
              )}
            >
              Total: {totalPoints} pts
              {!isExpanded ? <span className="ml-1">(Click to adjust)</span> : null}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onClear}>
              Clear
            </Button>
            <Button size="sm" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </div>

        {isExpanded && groups.length > 0 ? (
          <div className="flex flex-col gap-2 pt-3">{selectionRows}</div>
        ) : null}
      </Card>
    </div>
  );
};

export type { SelectionGroup };
export default SelectionSummary;
