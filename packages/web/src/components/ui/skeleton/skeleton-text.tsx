import type { FC } from 'react';
import classNames from 'classnames';
import { Skeleton } from './skeleton';

export const SkeletonText: FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 3, className, lastLineWidth = '75%' }) => (
  <div className={classNames('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} height={16} width={index === lines - 1 ? lastLineWidth : '100%'} />
    ))}
  </div>
);
