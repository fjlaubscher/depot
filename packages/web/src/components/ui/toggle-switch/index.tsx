import type { FC } from 'react';
import { cx } from '@/utils/cx';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
  testId?: string;
}

const sizeClasses = {
  sm: { track: 'h-5 w-9', knob: 'h-4 w-4 peer-checked:translate-x-4' },
  md: { track: 'h-6 w-11', knob: 'h-5 w-5 peer-checked:translate-x-5' }
};

/** Native checkbox styled as a switch; the input overlays the track so it stays clickable. */
const ToggleSwitch: FC<ToggleSwitchProps> = ({
  label,
  enabled,
  onChange,
  size = 'md',
  ariaLabel,
  testId
}) => (
  <label className="flex items-center gap-2">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <span
      className={cx(
        'relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent bg-surface-soft transition-colors duration-200 ease-in-out has-[:checked]:bg-accent-600 dark:has-[:checked]:bg-accent-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 dark:has-[:focus-visible]:outline-accent-500',
        sizeClasses[size].track
      )}
    >
      <input
        type="checkbox"
        role="switch"
        className="peer absolute inset-0 m-0 cursor-pointer appearance-none opacity-0"
        checked={enabled}
        aria-checked={enabled}
        aria-label={ariaLabel || label}
        data-testid={testId}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none inline-block translate-x-0 transform rounded-full bg-surface-card shadow-e1 transition duration-200 ease-in-out',
          sizeClasses[size].knob
        )}
      />
    </span>
  </label>
);

export default ToggleSwitch;
