import type { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const Card: FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  interactive,
  onClick,
  ...props
}) => {
  const isInteractive = interactive ?? typeof onClick === 'function';

  const baseClasses = [
    'surface-card transition-shadow duration-200',
    isInteractive
      ? 'hover:border-primary-500/60 hover:shadow-md dark:hover:border-primary-400/50'
      : ''
  ]
    .filter(Boolean)
    .join(' ');

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
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
