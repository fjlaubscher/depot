import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useDocumentTitle } from '@/hooks/use-document-title';
import IconButton from '../icon-button';
import Logo from '@/components/logo';

interface LayoutProps {
  children: ReactNode;
  title: string;
  sidebar?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children, title, sidebar }) => {
  const { state, closeSidebar, toggleSidebar } = useLayoutContext();
  const { sidebarOpen } = state;

  // Set document title
  useDocumentTitle(title);

  // Close sidebar when resizing to desktop on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= BREAKPOINTS.LG && sidebarOpen) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="flex flex-col h-screen surface-muted">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar */}
      {sidebar && (
        <aside
          className={`
            fixed top-0 right-0 z-50 w-64 h-full surface-base shadow-lg border-l border-subtle transform transition-transform duration-300 ease-in-out lg:hidden
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-subtle">
            <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="w-10 h-10 text-white">
                <Logo />
              </div>
              <span className="text-xl font-bold text-foreground">depot</span>
            </Link>
            <IconButton
              onClick={closeSidebar}
              variant="ghost"
              className="!text-white"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </IconButton>
          </div>

          {/* Sidebar content */}
          <div className="p-4 overflow-y-auto">{sidebar}</div>
        </aside>
      )}

      {/* Header */}
      <header className="bg-primary-500 shadow-sm flex-shrink-0 z-30">
        <div className="px-4">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - logo + app name */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
              >
                <div className="w-10 h-10 text-white">
                  <Logo />
                </div>
                <span className="text-xl font-bold text-foreground">depot</span>
              </Link>
            </div>

            {/* Right side - Mobile Menu */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              {sidebar && (
                <IconButton
                  onClick={toggleSidebar}
                  variant="ghost"
                  className="lg:hidden !text-white"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </IconButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 surface-base border-r border-subtle flex-shrink-0">
            <div className="p-4 overflow-y-auto h-full">{sidebar}</div>
          </aside>
        )}

        {/* Main content */}
        <main id="app-content" className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
