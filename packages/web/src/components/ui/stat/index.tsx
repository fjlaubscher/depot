import type { FC, ReactNode } from 'react';
import classNames from 'classnames';

interface StatProps {
  title?: string;
  value: ReactNode;
  description?: string;
  variant?: 'default' | 'large';
  className?: string;
}

const Stat: FC<StatProps> = ({ title, value, description, variant = 'default', className }) => {
  return (
    <div className={classNames('text-center flex flex-col gap-1', className)}>
      {title && (
        <div
          className={classNames(
            'font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide',
            {
              'text-xs': variant === 'default',
              'text-sm': variant === 'large'
            }
          )}
        >
          {title}
        </div>
      )}
      <div
        className={classNames('font-bold text-gray-900 dark:text-white', {
          'text-lg': variant === 'default',
          'text-2xl': variant === 'large'
        })}
      >
        {value}
      </div>
      {description && (
        <div
          className={classNames('text-gray-500 dark:text-gray-400', {
            'text-sm': variant === 'default',
            'text-base': variant === 'large'
          })}
        >
          {description}
        </div>
      )}
    </div>
  );
};

export default Stat;
