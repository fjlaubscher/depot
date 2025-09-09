import React from 'react';
import classNames from 'classnames';
import {
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { Toast as ToastType } from '@/contexts/toast/types';
import IconButton from '../icon-button';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const { id, title, message, type } = toast;

  const typeConfig = {
    success: {
      icon: <FaCheck />,
      bgColor: 'bg-green-50 dark:bg-green-800',
      borderColor: 'border-green-200 dark:border-green-700',
      iconColor: 'text-green-500 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-100',
      messageColor: 'text-green-700 dark:text-green-200'
    },
    error: {
      icon: <FaExclamationCircle />,
      bgColor: 'bg-red-50 dark:bg-red-800',
      borderColor: 'border-red-200 dark:border-red-700',
      iconColor: 'text-red-500 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-100',
      messageColor: 'text-red-700 dark:text-red-200'
    },
    warning: {
      icon: <FaExclamationTriangle />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-800',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      titleColor: 'text-yellow-800 dark:text-yellow-100',
      messageColor: 'text-yellow-700 dark:text-yellow-200'
    },
    info: {
      icon: <FaInfoCircle />,
      bgColor: 'bg-blue-50 dark:bg-blue-800',
      borderColor: 'border-blue-200 dark:border-blue-700',
      iconColor: 'text-blue-500 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-100',
      messageColor: 'text-blue-700 dark:text-blue-200'
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
              <FaTimes className="h-3 w-3" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
