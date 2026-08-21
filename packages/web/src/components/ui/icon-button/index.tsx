import type { FC, ButtonHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md';
  'aria-label': string; // Required for accessibility
}

// The visual box can be 36px, but the tappable area never drops below 44px —
// this app is used one-handed at a table. The pseudo-element adds hit area
// without affecting layout.
const HIT_AREA =
  "relative after:absolute after:content-[''] after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:size-11";

const IconButton: FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-sm border transition-colors duration-75 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-ring-primary';

  const variantClasses = {
    default: 'bg-surface-muted hover:bg-surface-soft text-body border-border-strong',
    ghost: 'bg-transparent hover:bg-surface-soft text-muted border-transparent'
  };

  const sizeClasses = {
    sm: 'size-9 text-sm',
    md: 'size-11 text-base'
  };

  return (
    <button
      className={cx(baseClasses, HIT_AREA, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
