import { useContext } from 'react';
import ToastContext from './context';
import { ToastContextType } from './types';

// Hook to use the toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};