import { useContext } from 'react';
import { RosterContext } from './context';
import { RosterContextValue } from './types';

export const useRoster = (): RosterContextValue => {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
};
