import type { FC } from 'react';
import { cx } from '@/utils/cx';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
}

const variantClasses = {
  rectangular: 'rounded-xs',
  rounded: 'rounded-sm',
  circular: 'rounded-full'
};

export const Skeleton: FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular'
}) => (
  <div
    className={cx('bg-surface-soft animate-pulse', variantClasses[variant], className)}
    style={{
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height })
    }}
  />
);

export const SkeletonCard: FC<{ className?: string }> = ({ className }) => (
  <div className={cx('p-4 surface-card', className)}>
    <div className="flex items-center justify-between">
      <Skeleton width="60%" height={20} />
      <Skeleton variant="circular" width={20} height={20} />
    </div>
  </div>
);

export const PageHeaderSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cx('flex items-start justify-between gap-4', className)}>
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
  <div className={cx('flex flex-col gap-2', className)} data-testid="field-skeleton">
    <Skeleton height={16} width="30%" />
    <Skeleton height={40} width="100%" variant="rounded" />
  </div>
);
