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
      'inline-flex cursor-pointer items-center gap-2 rounded-sm border px-3 min-h-11 text-sm font-bold transition focus-ring-primary',
      selected
        ? 'border-border-accent bg-surface-accent text-accent shadow-e1'
        : 'border-border-subtle bg-surface-card text-foreground hover:border-border-accent hover:bg-surface-accent'
    )}
    aria-pressed={selected}
    data-testid={`wargear-pill-${weapon.id}`}
  >
    {weapon.name}
  </button>
);

export default WargearRow;
