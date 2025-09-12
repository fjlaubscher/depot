import type { FC, ReactNode, HTMLAttributes } from 'react';
import classNames from 'classnames';
import IconButton from '../icon-button';

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: {
    icon: ReactNode;
    onClick: () => void;
    ariaLabel: string;
    variant?: 'default' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    testId?: string;
  };
  className?: string;
  'data-testid'?: string;
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
  'data-testid': dataTestId,
  ...props
}) => {
  return (
    <div
      className={classNames('flex items-start justify-between gap-4', className)}
      data-testid={dataTestId || 'page-header'}
      {...props}
    >
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </div>

      {action && (
        <IconButton
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          variant={action.variant}
          size={action.size}
          loading={action.loading}
          disabled={action.disabled}
          data-testid={action.testId || 'page-header-action'}
        >
          {action.icon}
        </IconButton>
      )}
    </div>
  );
};

export default PageHeader;
