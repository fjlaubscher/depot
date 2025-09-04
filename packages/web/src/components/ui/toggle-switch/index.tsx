import React from 'react';
import classNames from 'classnames';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange, size = 'md' }) => {
  const sizeClasses = {
    sm: { container: 'h-5 w-9', knob: 'h-4 w-4', translate: 'translate-x-4' },
    md: { container: 'h-6 w-11', knob: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { container: 'h-7 w-12', knob: 'h-6 w-6', translate: 'translate-x-5' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center">
      <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>
      <button
        type="button"
        className={classNames(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          currentSize.container,
          {
            'bg-primary-600': enabled,
            'bg-gray-200 dark:bg-gray-700': !enabled
          }
        )}
        onClick={() => onChange(!enabled)}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={classNames(
            'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            currentSize.knob,
            { [currentSize.translate]: enabled, 'translate-x-0': !enabled }
          )}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
