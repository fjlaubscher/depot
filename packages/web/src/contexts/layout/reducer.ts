import { LayoutState, LayoutAction } from './types';
import { LAYOUT_ACTIONS } from './constants';

// Initial state
export const initialLayoutState: LayoutState = {
  sidebarOpen: false
};

// Reducer
export const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case LAYOUT_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case LAYOUT_ACTIONS.OPEN_SIDEBAR:
      return { ...state, sidebarOpen: true };

    case LAYOUT_ACTIONS.CLOSE_SIDEBAR:
      return { ...state, sidebarOpen: false };

    default:
      return state;
  }
};
