import type { FC, ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md';
  'aria-label': string; // Required for accessibility
}

const IconButton: FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md transition-all duration-75 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    default:
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-body border border-gray-200 dark:border-gray-600',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-muted'
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base'
  };

  return (
    <button
      className={classNames(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
