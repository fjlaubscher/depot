import React from 'react';
import classNames from 'classnames';

interface FiltersProps {
  children: React.ReactNode;
  showClear: boolean;
  onClear: () => void;
  className?: string;
}

const Filters: React.FC<FiltersProps> = ({ children, showClear, onClear, className }) => (
  <div className={classNames('flex items-center justify-between gap-4 mb-6', className)}>
    <div className="flex-1">
      {children}
    </div>
    {showClear && (
      <button
        onClick={onClear}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium text-sm whitespace-nowrap"
      >
        Clear
      </button>
    )}
  </div>
);

export default Filters;