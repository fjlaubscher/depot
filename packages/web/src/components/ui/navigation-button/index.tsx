import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface NavigationButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  to,
  children,
  className,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';

  return (
    <Link to={to} className={classNames(baseClasses, className)} {...props}>
      {children}
    </Link>
  );
};

export default NavigationButton;
