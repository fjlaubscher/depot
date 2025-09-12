import type { FC } from 'react';
import classNames from 'classnames';
import { Skeleton } from './skeleton';

export const PageHeaderSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('flex items-start justify-between gap-4', className)}>
    <div className="min-w-0 flex-1 flex flex-col gap-2">
      <Skeleton height={32} width="60%" />
      <Skeleton height={16} width="40%" />
    </div>
    <div className="flex-shrink-0">
      <Skeleton variant="circular" width={40} height={40} />
    </div>
  </div>
);
