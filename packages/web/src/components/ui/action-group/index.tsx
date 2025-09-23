import React, { ReactNode } from 'react';
import classNames from 'classnames';
import IconButton from '../icon-button';

export interface Action {
  icon: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
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

const getIconButtonVariant = (variant: Action['variant']): 'default' | 'ghost' => {
  // Map our action variants to IconButton variants
  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return 'ghost'; // Use ghost so we can apply custom colors
    case 'default':
      return 'default';
    case 'ghost':
    default:
      return 'ghost';
  }
};

const getVariantClasses = (variant: Action['variant'] = 'ghost') => {
  const variantClasses = {
    primary: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    secondary: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
    danger: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    default: '',
    ghost: ''
  };
  return variantClasses[variant];
};

export const ActionGroup: React.FC<ActionGroupProps> = ({
  actions,
  className,
  spacing = 'normal'
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={classNames('flex items-center', getSpacingClass(spacing), className)}>
      {actions.map((action, index) => (
        <IconButton
          key={index}
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          variant={getIconButtonVariant(action.variant)}
          size={action.size || 'sm'}
          disabled={action.disabled}
          className={classNames(getVariantClasses(action.variant), action.className)}
          data-testid={action['data-testid']}
        >
          {action.icon}
        </IconButton>
      ))}
    </div>
  );
};

export default ActionGroup;
