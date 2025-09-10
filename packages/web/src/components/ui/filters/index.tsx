import type { FC, ReactNode } from 'react';
import classNames from 'classnames';

interface FiltersProps {
  children: ReactNode;
  showClear: boolean;
  onClear: () => void;
  className?: string;
}

const Filters: FC<FiltersProps> = ({ children, showClear, onClear, className }) => (
  <div
    className={classNames(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
      className
    )}
  >
    <div className="flex-1 flex flex-col sm:flex-row gap-4">{children}</div>
    {showClear && (
      <button
        onClick={onClear}
        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 font-medium text-sm whitespace-nowrap self-start sm:self-center"
      >
        Clear
      </button>
    )}
  </div>
);

export default Filters;
