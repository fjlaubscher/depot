import React from 'react';
import classNames from 'classnames';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'error';
    disabled?: boolean;
    loading?: boolean;
  };
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, className }) => {
  return (
    <div className={classNames('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </div>

      {action && (
        <div className="flex-shrink-0">
          <button
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={classNames(
              'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              {
                'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600':
                  !action.variant || action.variant === 'default',
                'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600':
                  action.variant === 'secondary',
                'bg-red-600 hover:bg-red-700 text-white border border-red-600':
                  action.variant === 'error'
              }
            )}
          >
            {action.loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              action.label
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
