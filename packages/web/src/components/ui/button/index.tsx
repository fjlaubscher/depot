import type { FC, ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'ghost' | 'error';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-bold rounded-sm border transition-colors duration-75 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-ring-primary';

  const variantClasses = {
    default:
      'bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-400 text-accent-ink border-transparent',
    secondary: 'bg-surface-card hover:bg-surface-soft text-foreground border-border-strong',
    accent: 'bg-info-surface hover:bg-info-surface text-info-fg border-info-border',
    ghost: 'bg-transparent hover:bg-surface-soft text-body border-transparent',
    error: 'bg-transparent hover:bg-danger-surface text-danger-fg border-danger-border'
  };

  // md is the default and stays at 44px — the minimum touch target at the table.
  const sizeClasses = {
    sm: 'h-9 px-3 text-[13px]',
    md: 'h-11 px-3.5 text-[13px]'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
