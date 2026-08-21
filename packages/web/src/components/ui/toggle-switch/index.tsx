import type { FC } from 'react';
import classNames from 'classnames';

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
    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>
    <span
      className={classNames(
        'relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out dark:bg-gray-700 has-[:checked]:bg-primary-600 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-offset-2',
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
        className={classNames(
          'pointer-events-none inline-block translate-x-0 transform rounded-full bg-white shadow transition duration-200 ease-in-out',
          sizeClasses[size].knob
        )}
      />
    </span>
  </label>
);

export default ToggleSwitch;
