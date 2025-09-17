import type { FC, ButtonHTMLAttributes } from 'react';
import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import Loader from '../loader';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  'aria-label': string; // Required for accessibility
}

const IconButton: FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  loading = false,
  className,
  disabled,
  onClick,
  children,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      setIsPressed(true);
      timeoutRef.current = setTimeout(() => setIsPressed(false), 60);
      onClick?.(e);
    }
  };

  const baseClasses =
    'inline-flex items-center justify-center rounded-md transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    default:
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isPressed ? 'scale-95' : '',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? <Loader size="sm" color="secondary" /> : children}
    </button>
  );
};

export default IconButton;
