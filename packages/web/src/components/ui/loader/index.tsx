import type { FC } from 'react';
import { cx } from '@/utils/cx';

interface LoaderProps {
  size?: 'sm' | 'md';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const Loader: FC<LoaderProps> = ({ size = 'md', color = 'primary', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2'
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-gray-400 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div
      data-testid="loader"
      className={cx('rounded-full animate-spin', sizeClasses[size], colorClasses[color], className)}
    />
  );
};

export default Loader;
