import type { FC, ReactNode } from 'react';
import { FactionsProvider } from './factions/context';
import { SettingsProvider } from './settings/context';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: FC<AppProviderProps> = ({ children }) => (
  <FactionsProvider>
    <SettingsProvider>{children}</SettingsProvider>
  </FactionsProvider>
);

export default AppProvider;
