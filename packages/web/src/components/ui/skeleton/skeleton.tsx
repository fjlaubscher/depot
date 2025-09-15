import type { FC } from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animate?: boolean;
}

export const Skeleton: FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular',
  animate = true
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
    circular: 'rounded-full'
  };

  const animationClasses = animate ? 'animate-pulse' : '';

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  };

  return (
    <div
      className={classNames(baseClasses, variantClasses[variant], animationClasses, className)}
      style={style}
    />
  );
};
