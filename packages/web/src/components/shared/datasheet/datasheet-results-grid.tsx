import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { Grid } from '@/components/ui';

interface DatasheetResultsGridProps {
  children: ReactNode;
  className?: string;
}

export const DatasheetResultsGrid: FC<DatasheetResultsGridProps> = ({ children, className }) => (
  <Grid
    cols={3}
    gap="md"
    className={classNames('min-h-[200px]', className)}
    aria-live="polite"
    id="datasheet-results"
  >
    {children}
  </Grid>
);

export default DatasheetResultsGrid;
