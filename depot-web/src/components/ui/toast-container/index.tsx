import React from 'react';
import { useToast } from '@/contexts/toast/use-toast-context';
import Toast from '../toast';

const ToastContainer: React.FC = () => {
  const { state, removeToast } = useToast();
  const { toasts } = state;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 right-0 z-50 p-6 space-y-4 pointer-events-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
