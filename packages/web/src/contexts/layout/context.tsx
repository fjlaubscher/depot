import type { FC, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@/hooks/use-media-query';

export interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // The mobile sidebar is `lg:hidden`, so past the breakpoint an open one is invisible state that
  // pops back (with its overlay) on the way down. Close it on the way up.
  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar: () => setSidebarOpen((open) => !open),
        closeSidebar: () => setSidebarOpen(false)
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

export default LayoutContext;
