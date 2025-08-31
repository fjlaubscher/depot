import React, { createContext, useReducer, useCallback } from 'react';
import { ToastContextType, Toast } from './types';
import { toastReducer, initialToastState } from './reducer';
import { TOAST_ACTIONS } from './constants';

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialToastState);

  // Generate unique ID for toasts
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Show toast with auto-dismiss
  const showToast = useCallback(
    (toastData: Omit<Toast, 'id'>) => {
      const id = generateId();
      const toast: Toast = {
        id,
        duration: 5000, // Default 5 second duration
        ...toastData
      };

      dispatch({ type: TOAST_ACTIONS.ADD_TOAST, payload: toast });

      // Auto-dismiss toast if duration is set
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          dispatch({ type: TOAST_ACTIONS.REMOVE_TOAST, payload: id });
        }, toast.duration);
      }
    },
    [generateId]
  );

  // Remove specific toast
  const removeToast = useCallback((id: string) => {
    dispatch({ type: TOAST_ACTIONS.REMOVE_TOAST, payload: id });
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    dispatch({ type: TOAST_ACTIONS.CLEAR_ALL_TOASTS });
  }, []);

  const contextValue: ToastContextType = {
    state,
    dispatch,
    showToast,
    removeToast,
    clearAllToasts
  };

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
};

export default ToastContext;
