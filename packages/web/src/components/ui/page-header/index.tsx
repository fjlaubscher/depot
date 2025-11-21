import type { FC, ReactNode, HTMLAttributes } from 'react';
import classNames from 'classnames';
import IconButton from '../icon-button';
import ActionGroup from '../action-group';
import type { Action } from '../action-group';

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  stats?: ReactNode;
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
  actions?: Action[];
  className?: string;
  'data-testid'?: string;
  alignActions?: 'inline' | 'right';
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  stats,
  action,
  actions,
  className,
  alignActions = 'right',
  'data-testid': dataTestId,
  ...props
}) => {
  const actionsIsInline = alignActions === 'inline';

  const renderActions = () => {
    if (actions && actions.length > 0) {
      return (
        <div className="flex-shrink-0">
          <ActionGroup actions={actions} spacing="tight" />
        </div>
      );
    }

    if (action) {
      return (
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
      );
    }

    return null;
  };

  return (
    <div
      className={classNames('flex flex-col gap-3', className)}
      data-testid={dataTestId || 'page-header'}
      {...props}
    >
      <div
        className={classNames(
          'flex gap-3',
          actionsIsInline ? 'items-center flex-wrap' : 'items-start justify-between'
        )}
      >
        <div
          className={classNames('min-w-0 flex flex-col gap-1', {
            'flex-1': !actionsIsInline
          })}
        >
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>

        {renderActions()}
      </div>

      {stats && <div className="flex-shrink-0">{stats}</div>}
    </div>
  );
};

export default PageHeader;
