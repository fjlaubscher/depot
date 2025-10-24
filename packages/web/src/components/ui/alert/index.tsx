import type { FC, ReactNode, HTMLAttributes } from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import classNames from 'classnames';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  children: ReactNode;
}

const Alert: FC<AlertProps> = ({ variant = 'info', title, children, className, ...props }) => {
  const baseClasses = 'flex flex-col gap-3 p-4 rounded-lg border';

  const variantClasses = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
    warning:
      'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
    success:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200',
    error:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
  };

  const iconClasses = {
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400',
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400'
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
