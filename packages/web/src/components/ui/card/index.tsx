import type { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow duration-200';

  const variantClasses = {
    default: 'shadow-sm',
    outlined: 'shadow-none'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={classNames(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
