import type { FC, ReactNode, HTMLAttributes } from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import classNames from 'classnames';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  children: ReactNode;
}

const Alert: FC<AlertProps> = ({ variant = 'info', title, children, className, ...props }) => {
  const baseClasses = 'flex flex-col gap-2 p-4 rounded-lg border';

  const variantClasses = {
    info: 'surface-info border-info text-info-strong',
    warning: 'surface-warning border-warning text-warning-strong',
    success: 'surface-success border-success text-success-strong',
    error: 'surface-danger border-danger text-danger-strong'
  };

  const iconClasses = {
    info: 'text-info',
    warning: 'text-warning',
    success: 'text-success',
    error: 'text-danger'
  };

  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle
  };

  const Icon = icons[variant];

  return (
    <div className={classNames(baseClasses, variantClasses[variant], className)} {...props}>
      <div className="flex gap-2 items-center">
        <Icon size={20} className={classNames('flex-shrink-0', iconClasses[variant])} />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Alert;
