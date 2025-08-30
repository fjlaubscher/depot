import React, { createContext, useReducer } from 'react';
import { LayoutContextType } from './types';
import { layoutReducer, initialLayoutState } from './reducer';
import { LAYOUT_ACTIONS } from './constants';

// Create context
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Provider component
interface LayoutProviderProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialLayoutState);

  // Action creators
  const toggleSidebar = () => {
    dispatch({ type: LAYOUT_ACTIONS.TOGGLE_SIDEBAR });
  };

  const openSidebar = () => {
    dispatch({ type: LAYOUT_ACTIONS.OPEN_SIDEBAR });
  };

  const closeSidebar = () => {
    dispatch({ type: LAYOUT_ACTIONS.CLOSE_SIDEBAR });
  };

  const contextValue: LayoutContextType = {
    state,
    dispatch,
    toggleSidebar,
    openSidebar,
    closeSidebar
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;