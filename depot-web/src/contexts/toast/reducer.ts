import { ToastState, ToastAction } from './types';
import { TOAST_ACTIONS } from './constants';

// Initial state
export const initialToastState: ToastState = {
  toasts: []
};

// Reducer
export const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case TOAST_ACTIONS.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
    
    case TOAST_ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    
    case TOAST_ACTIONS.CLEAR_ALL_TOASTS:
      return {
        ...state,
        toasts: []
      };
    
    default:
      return state;
  }
};