import type { FC, ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'error';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-75 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantClasses = {
    default: 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600',
    accent:
      'bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-200 dark:border-blue-800',
    error: 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
