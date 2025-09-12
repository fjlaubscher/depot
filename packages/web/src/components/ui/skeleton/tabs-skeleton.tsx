import type { FC } from 'react';
import classNames from 'classnames';
import { Skeleton } from './skeleton';

export const TabsSkeleton: FC<{
  className?: string;
  tabCount?: number;
}> = ({ className, tabCount = 2 }) => (
  <div className={classNames('border-b border-gray-200 dark:border-gray-700', className)}>
    <nav className="-mb-px flex gap-4">
      {Array.from({ length: tabCount }).map((_, index) => (
        <div key={index} className="py-4 px-1 border-b-2 border-transparent">
          <Skeleton height={20} width={80} />
        </div>
      ))}
    </nav>
  </div>
);
