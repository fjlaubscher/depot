import type { FC, ReactNode } from 'react';
import { cx } from '@/utils/cx';

interface FiltersProps {
  children: ReactNode;
  showClear: boolean;
  onClear: () => void;
  className?: string;
  clearTestId?: string;
}

const Filters: FC<FiltersProps> = ({ children, showClear, onClear, className, clearTestId }) => (
  <div className={cx('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
    <div className="flex-1 flex flex-col sm:flex-row gap-4">{children}</div>
    {showClear && (
      <button
        onClick={onClear}
        data-testid={clearTestId}
        className="text-accent hover:text-accent-500 font-medium text-sm whitespace-nowrap self-start sm:self-center"
      >
        Clear
      </button>
    )}
  </div>
);

export default Filters;
