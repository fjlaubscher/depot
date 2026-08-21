import type { FC } from 'react';
import { useToast } from '@/contexts/toast/context';
import Toast from '../toast';

const ToastContainer: FC = () => {
  const { state, removeToast } = useToast();
  const { toasts } = state;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-end gap-1.5 p-3 sm:inset-x-auto sm:right-0 sm:p-4"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
