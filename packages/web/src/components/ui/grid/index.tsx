import type { FC, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 2 | 3;
}

const colsClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
};

const Grid: FC<GridProps> = ({ cols = 3, className, children, ...props }) => (
  <div className={cx('grid gap-4', colsClasses[cols], className)} {...props}>
    {children}
  </div>
);

export default Grid;
