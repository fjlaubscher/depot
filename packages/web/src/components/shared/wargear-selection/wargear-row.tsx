import classNames from 'classnames';
import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { Tag } from '@/components/ui';

interface WargearTableRowProps {
  weapon: depot.Wargear;
  showSelectionColumn?: boolean;
  selectedWargear?: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearRow = ({
  weapon,
  showSelectionColumn = false,
  selectedWargear = [],
  onSelectionChange
}: WargearTableRowProps) => {
  const isSelected = selectedWargear.some((selected) => selected.id === weapon.id);
  const isInteractive = showSelectionColumn && Boolean(onSelectionChange);

  const handleToggle = useCallback(() => {
    if (isInteractive && onSelectionChange) {
      onSelectionChange(weapon, !isSelected);
    }
  }, [isInteractive, onSelectionChange, weapon, isSelected]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={classNames(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface',
        isInteractive ? 'cursor-pointer' : 'cursor-default',
        isSelected
          ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm dark:border-primary-400 dark:bg-primary-900/40 dark:text-primary-50'
          : 'border-subtle bg-surface text-foreground hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
      )}
      aria-pressed={isSelected}
      data-testid={`wargear-pill-${weapon.id}`}
      disabled={!isInteractive}
    >
      <span>{weapon.name}</span>
      <Tag variant="secondary" size="sm" className="uppercase">
        {weapon.type}
      </Tag>
    </button>
  );
};

export default WargearRow;
