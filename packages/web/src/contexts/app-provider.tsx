import type { FC, ReactNode } from 'react';
import { FactionsProvider } from './factions/context';
import { SettingsProvider } from './settings/context';
import { ToastProvider } from './toast/context';

/** Factions + Settings + Toast. Roster is mounted separately (it needs Toast). */
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <FactionsProvider>
    <SettingsProvider>
      <ToastProvider>{children}</ToastProvider>
    </SettingsProvider>
  </FactionsProvider>
);

export default AppProvider;
