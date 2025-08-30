// Layout state interface
export interface LayoutState {
  sidebarOpen: boolean;
}

// Layout action types
export type LayoutAction = 
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' };

// Layout context interface
export interface LayoutContextType {
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}