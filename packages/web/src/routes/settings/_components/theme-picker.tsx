import type { depot } from '@depot/core';

import { cx } from '@/utils/cx';

const OPTIONS: depot.Theme[] = ['light', 'system', 'dark'];

interface Props {
  value: depot.Theme;
  onChange: (theme: depot.Theme) => void;
}

/** Three-way segmented control — one tap to the theme you want, in a dim room. */
const ThemePicker = ({ value, onChange }: Props) => (
  <div
    className="flex gap-0.5 rounded-sm border border-border-subtle bg-surface-muted p-0.5"
    role="radiogroup"
    aria-label="Theme"
    data-testid="theme"
  >
    {OPTIONS.map((option) => (
      <button
        key={option}
        type="button"
        role="radio"
        aria-checked={value === option}
        onClick={() => onChange(option)}
        data-testid={`theme-${option}`}
        className={cx(
          'min-h-11 flex-1 rounded-xs border px-2.5 text-[11px] font-bold capitalize transition-colors',
          value === option
            ? 'border-border-strong bg-surface-soft text-foreground'
            : 'border-transparent text-muted hover:text-foreground'
        )}
      >
        {option}
      </button>
    ))}
  </div>
);

export default ThemePicker;
