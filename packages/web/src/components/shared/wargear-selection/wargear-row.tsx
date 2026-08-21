import { cx } from '@/utils/cx';
import type { depot } from '@depot/core';

interface WargearRowProps {
  weapon: depot.Wargear;
  selected: boolean;
  onToggle: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearRow = ({ weapon, selected, onToggle }: WargearRowProps) => (
  <button
    type="button"
    onClick={() => onToggle(weapon, !selected)}
    className={cx(
      'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface',
      selected
        ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm dark:border-primary-400 dark:bg-primary-900/40 dark:text-primary-50'
        : 'border-subtle bg-surface text-foreground hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
    )}
    aria-pressed={selected}
    data-testid={`wargear-pill-${weapon.id}`}
  >
    {weapon.name}
  </button>
);

export default WargearRow;
