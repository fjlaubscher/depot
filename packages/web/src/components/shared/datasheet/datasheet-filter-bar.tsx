import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { Filters, Search } from '@/components/ui';

interface DatasheetFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  searchPlaceholder: string;
  showClear: boolean;
  className?: string;
  children?: ReactNode;
  searchTestId?: string;
  clearTestId?: string;
}

export const DatasheetFilterBar: FC<DatasheetFilterBarProps> = ({
  query,
  onQueryChange,
  onClear,
  searchPlaceholder,
  showClear,
  className,
  children,
  searchTestId,
  clearTestId
}) => (
  <div className={classNames('flex flex-col gap-3', className)}>
    <Filters showClear={showClear} onClear={onClear} clearTestId={clearTestId}>
      <Search
        label="Search datasheets"
        value={query}
        onChange={onQueryChange}
        placeholder={searchPlaceholder}
        testId={searchTestId}
        className="w-full sm:max-w-3xl"
      />
      {children}
    </Filters>
  </div>
);

export default DatasheetFilterBar;
