import type { FC, ReactNode } from 'react';
import { FactionsProvider } from './factions/context';
import { SettingsProvider } from './settings/context';
import { ToastProvider } from './toast/context';
import { LayoutProvider } from './layout/context';

/** Factions + Settings + Toast + Layout. Roster is mounted separately (it needs Toast). */
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <FactionsProvider>
    <SettingsProvider>
      <ToastProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </ToastProvider>
    </SettingsProvider>
  </FactionsProvider>
);

export default AppProvider;
