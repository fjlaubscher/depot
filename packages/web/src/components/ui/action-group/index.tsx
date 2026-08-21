import type { FC, ReactNode, MouseEvent } from 'react';
import { cx } from '@/utils/cx';
import IconButton from '../icon-button';

export interface Action {
  icon: ReactNode;
  onClick: (e?: MouseEvent) => void;
  ariaLabel: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

interface ActionGroupProps {
  actions: Action[];
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const getSpacingClass = (spacing: ActionGroupProps['spacing'] = 'normal') => {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3'
  };
  return spacingClasses[spacing];
};

// Coloured variants use ghost so the custom text colours apply.
const getIconButtonVariant = (variant: Action['variant']): 'default' | 'ghost' =>
  variant === 'default' ? 'default' : 'ghost';

const getVariantClasses = (variant: Action['variant'] = 'ghost') => {
  const variantClasses = {
    primary: 'text-info-fg hover:bg-info-surface',
    secondary: 'text-success-fg hover:bg-success-surface',
    danger: 'text-danger-fg hover:bg-danger-surface',
    default: '',
    ghost: ''
  };
  return variantClasses[variant];
};

export const ActionGroup: FC<ActionGroupProps> = ({ actions, className, spacing = 'normal' }) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={cx('flex items-center', getSpacingClass(spacing), className)}>
      {actions.map((action, index) => (
        <IconButton
          key={index}
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          variant={getIconButtonVariant(action.variant)}
          size={action.size || 'sm'}
          disabled={action.disabled}
          className={cx(getVariantClasses(action.variant), action.className)}
          data-testid={action['data-testid']}
        >
          {action.icon}
        </IconButton>
      ))}
    </div>
  );
};

export default ActionGroup;
