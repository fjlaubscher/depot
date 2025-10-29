import type { FC } from 'react';
import classNames from 'classnames';
import { Skeleton } from './skeleton';

export const SkeletonCard: FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('p-4 surface-card', className)}>
    <div className="flex items-center justify-between">
      <Skeleton width="60%" height={20} />
      <Skeleton variant="circular" width={20} height={20} />
    </div>
  </div>
);
