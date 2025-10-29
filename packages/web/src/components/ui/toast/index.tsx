import type { FC } from 'react';
import classNames from 'classnames';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Toast as ToastType } from '@/contexts/toast/types';
import IconButton from '../icon-button';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: FC<ToastProps> = ({ toast, onRemove }) => {
  const { id, title, message, type } = toast;

  const typeConfig = {
    success: {
      icon: <Check size={16} />,
      bgColor: 'surface-success',
      borderColor: 'border-success',
      iconColor: 'text-success',
      titleColor: 'text-success-strong',
      messageColor: 'text-success'
    },
    error: {
      icon: <AlertCircle size={16} />,
      bgColor: 'surface-danger',
      borderColor: 'border-danger',
      iconColor: 'text-danger',
      titleColor: 'text-danger-strong',
      messageColor: 'text-danger'
    },
    warning: {
      icon: <AlertTriangle size={16} />,
      bgColor: 'surface-warning',
      borderColor: 'border-warning',
      iconColor: 'text-warning',
      titleColor: 'text-warning-strong',
      messageColor: 'text-warning'
    },
    info: {
      icon: <Info size={16} />,
      bgColor: 'surface-info',
      borderColor: 'border-info',
      iconColor: 'text-info',
      titleColor: 'text-info-strong',
      messageColor: 'text-info'
    }
  };

  const config = typeConfig[type];

  return (
    <div
      className={classNames(
        'w-80 shadow-lg rounded-lg pointer-events-auto border',
        'transform transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-right-full fade-in',
        'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className={classNames('flex-shrink-0', config.iconColor)}>{config.icon}</div>
          <div className="w-0 flex-1 flex flex-col gap-1">
            <p className={classNames('text-sm font-medium', config.titleColor)}>{title}</p>
            {message && <p className={classNames('text-sm', config.messageColor)}>{message}</p>}
          </div>
          <div className="flex-shrink-0 flex">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              aria-label="Close notification"
            >
              <X size={12} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
