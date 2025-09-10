import type { FC, ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import Loader from '../loader';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'error';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantClasses = {
    default: 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600',
    error: 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader size="sm" color="white" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
