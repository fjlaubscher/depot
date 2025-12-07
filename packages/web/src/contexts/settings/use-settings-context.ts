import { useContext } from 'react';
import SettingsContext from './context';
import type { SettingsContextType } from './types';

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
