import type { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const Grid: FC<GridProps> = ({
  cols = 3,
  gap = 'md',
  responsive = true,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'grid';

  const colsClasses = responsive
    ? {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
        12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12'
      }
    : {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        6: 'grid-cols-6',
        12: 'grid-cols-12'
      };

  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div
      className={classNames(baseClasses, colsClasses[cols], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Grid;
