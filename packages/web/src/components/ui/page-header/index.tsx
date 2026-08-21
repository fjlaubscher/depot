import type { FC, ReactNode, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
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
    size?: 'sm' | 'md';
    disabled?: boolean;
    testId?: string;
  };
  actions?: Action[];
  className?: string;
  'data-testid'?: string;
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  stats,
  action,
  actions,
  className,
  'data-testid': dataTestId,
  ...props
}) => {
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
      className={cx('flex flex-col', className)}
      data-testid={dataTestId || 'page-header'}
      {...props}
    >
      <div className="flex gap-2 items-start justify-between">
        <div className="min-w-0 flex flex-col flex-1">
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
