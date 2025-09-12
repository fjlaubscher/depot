import type { FC } from 'react';
import classNames from 'classnames';
import { Skeleton } from './skeleton';

export const SkeletonCard: FC<{ className?: string }> = ({ className }) => (
  <div
    className={classNames(
      'p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800',
      className
    )}
  >
    <div className="flex items-center justify-between">
      <Skeleton width="60%" height={20} />
      <Skeleton variant="circular" width={20} height={20} />
    </div>
  </div>
);
