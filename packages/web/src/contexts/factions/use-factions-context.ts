import { useContext } from 'react';
import FactionsContext from './context';
import type { FactionsContextType } from './types';

export const useFactionsContext = (): FactionsContextType => {
  const context = useContext(FactionsContext);
  if (!context) {
    throw new Error('useFactionsContext must be used within a FactionsProvider');
  }
  return context;
};
