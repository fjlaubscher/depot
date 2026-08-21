import type { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 2 | 3;
  /** Only the default spacing is used; callers still pass it explicitly. */
  gap?: 'md';
}

const colsClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
};

const Grid: FC<GridProps> = ({ cols = 3, gap: _gap, className, children, ...props }) => (
  <div className={classNames('grid gap-4', colsClasses[cols], className)} {...props}>
    {children}
  </div>
);

export default Grid;
