import React from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
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
      className={classNames(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        className
      )}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800', className)}>
    <div className="flex items-center justify-between">
      <Skeleton width="60%" height={20} />
      <Skeleton variant="circular" width={20} height={20} />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string; 
  lastLineWidth?: string;
}> = ({ 
  lines = 3, 
  className,
  lastLineWidth = '75%'
}) => (
  <div className={classNames('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? lastLineWidth : '100%'}
      />
    ))}
  </div>
);

export default Skeleton;