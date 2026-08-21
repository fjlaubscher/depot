import type { FC, ReactNode, HTMLAttributes } from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cx } from '@/utils/cx';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  children: ReactNode;
}

const Alert: FC<AlertProps> = ({ variant = 'info', title, children, className, ...props }) => {
  const baseClasses = 'flex flex-col gap-2 p-4 rounded-sm border';

  const variantClasses = {
    info: 'bg-info-surface border-info-border text-info-fg',
    warning: 'bg-warning-surface border-warning-border text-warning-fg',
    success: 'bg-success-surface border-success-border text-success-fg',
    error: 'bg-danger-surface border-danger-border text-danger-fg'
  };

  const iconClasses = {
    info: 'text-info-fg',
    warning: 'text-warning-fg',
    success: 'text-success-fg',
    error: 'text-danger-fg'
  };

  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle
  };

  const Icon = icons[variant];

  return (
    <div className={cx(baseClasses, variantClasses[variant], className)} {...props}>
      <div className="flex gap-2 items-center">
        <Icon size={20} className={cx('flex-shrink-0', iconClasses[variant])} />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Alert;
