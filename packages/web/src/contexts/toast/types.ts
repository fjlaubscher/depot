// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number; // Auto-dismiss duration in ms, null for persistent
}

// Toast state interface
export interface ToastState {
  toasts: Toast[];
}

// Toast action types
export type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }; // toast id

// Toast context interface
export interface ToastContextType {
  state: ToastState;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
