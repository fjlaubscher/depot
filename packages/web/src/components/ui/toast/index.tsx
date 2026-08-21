import type { FC } from 'react';
import { cx } from '@/utils/cx';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Toast as ToastType } from '@/contexts/toast/context';
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
      bgColor: 'bg-success-surface',
      borderColor: 'border-success-border',
      iconColor: 'text-success-fg',
      titleColor: 'text-success-fg',
      messageColor: 'text-success-fg'
    },
    error: {
      icon: <AlertCircle size={16} />,
      bgColor: 'bg-danger-surface',
      borderColor: 'border-danger-border',
      iconColor: 'text-danger-fg',
      titleColor: 'text-danger-fg',
      messageColor: 'text-danger-fg'
    },
    warning: {
      icon: <AlertTriangle size={16} />,
      bgColor: 'bg-warning-surface',
      borderColor: 'border-warning-border',
      iconColor: 'text-warning-fg',
      titleColor: 'text-warning-fg',
      messageColor: 'text-warning-fg'
    },
    info: {
      icon: <Info size={16} />,
      bgColor: 'bg-info-surface',
      borderColor: 'border-info-border',
      iconColor: 'text-info-fg',
      titleColor: 'text-info-fg',
      messageColor: 'text-info-fg'
    }
  };

  const config = typeConfig[type];

  return (
    <div
      className={cx(
        'w-80 shadow-lg rounded-sm pointer-events-auto border',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className={cx('flex-shrink-0', config.iconColor)}>{config.icon}</div>
          <div className="w-0 flex-1 flex flex-col gap-1">
            <p className={cx('text-sm font-medium', config.titleColor)}>{title}</p>
            {message && <p className={cx('text-sm', config.messageColor)}>{message}</p>}
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
