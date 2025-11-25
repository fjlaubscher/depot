import type { FC, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { Grid } from '@/components/ui';

interface RosterUnitGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const RosterUnitGrid: FC<RosterUnitGridProps> = ({ children, className, ...rest }) => (
  <Grid cols={3} gap="md" className={classNames('w-full', className)} {...rest}>
    {children}
  </Grid>
);

export default RosterUnitGrid;
