import React from 'react';
import classNames from 'classnames';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 transition-shadow duration-200';
  
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
  
  const hoverClasses = hover ? 'hover:shadow-md cursor-pointer' : '';

  return (
    <div
      className={classNames(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;