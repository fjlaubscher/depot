import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { Grid } from '@/components/ui';

interface RosterUnitGridProps {
  children: ReactNode;
  className?: string;
}

const RosterUnitGrid: FC<RosterUnitGridProps> = ({ children, className }) => (
  <Grid cols={3} gap="md" className={classNames('w-full', className)}>
    {children}
  </Grid>
);

export default RosterUnitGrid;
