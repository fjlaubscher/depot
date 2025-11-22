import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { Tag } from '@/components/ui';

interface WargearTableRowProps {
  weapon: depot.Wargear;
  showSelectionColumn: boolean;
  selectedWargear: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearRow = ({
  weapon,
  showSelectionColumn,
  selectedWargear,
  onSelectionChange
}: WargearTableRowProps) => {
  const isSelected = selectedWargear.some((selected) => selected.id === weapon.id);

  const handleToggle = useCallback(
    (event?: React.ChangeEvent<HTMLInputElement>) => {
      event?.stopPropagation();
      if (onSelectionChange) {
        onSelectionChange(weapon, !isSelected);
      }
    },
    [weapon, isSelected, onSelectionChange]
  );

  const handleCardClick = () => {
    if (showSelectionColumn && onSelectionChange) {
      onSelectionChange(weapon, !isSelected);
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/30 rounded hover:bg-gray-100/80 dark:hover:bg-gray-600/40 transition-colors ${
        showSelectionColumn ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {showSelectionColumn && (
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggle}
            className="cursor-pointer rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-800"
            data-testid={`wargear-checkbox-${weapon.id}`}
          />
        </div>
      )}
      <div className="flex-grow flex flex-col gap-2">
        <div className="font-medium text-foreground">{weapon.name}</div>
        <div className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-subtle">
          <Tag variant="secondary" size="sm" className="uppercase">
            {weapon.type}
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default WargearRow;
