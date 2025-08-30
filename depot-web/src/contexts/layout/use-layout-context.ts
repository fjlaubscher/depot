import { useContext } from 'react';
import LayoutContext from './context';
import { LayoutContextType } from './types';

// Hook to use the layout context
export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};