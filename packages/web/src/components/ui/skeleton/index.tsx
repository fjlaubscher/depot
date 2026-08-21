import type { FC } from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
}

const variantClasses = {
  rectangular: 'rounded-none',
  rounded: 'rounded-md',
  circular: 'rounded-full'
};

export const Skeleton: FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular'
}) => (
  <div
    className={classNames(
      'bg-gray-200 dark:bg-gray-700 animate-pulse',
      variantClasses[variant],
      className
    )}
    style={{
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height })
    }}
  />
);

export const SkeletonCard: FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('p-4 surface-card', className)}>
    <div className="flex items-center justify-between">
      <Skeleton width="60%" height={20} />
      <Skeleton variant="circular" width={20} height={20} />
    </div>
  </div>
);

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

export const FieldSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('flex flex-col gap-2', className)} data-testid="field-skeleton">
    <Skeleton height={16} width="30%" />
    <Skeleton height={40} width="100%" variant="rounded" />
  </div>
);
