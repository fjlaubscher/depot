import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLayoutContext } from '@/contexts/layout/context';
import { useDocumentTitle } from '@/hooks/use-document-title';
import IconButton from '../icon-button';
import Logo from '@/components/logo';

interface LayoutProps {
  children: ReactNode;
  title: string;
  sidebar?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children, title, sidebar }) => {
  const { sidebarOpen, closeSidebar, toggleSidebar } = useLayoutContext();

  useDocumentTitle(title);

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-surface-overlay z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Mobile sidebar */}
      {sidebar && (
        <aside
          className={`
            fixed top-0 right-0 z-50 w-64 h-full bg-surface-elevated shadow-e3 border-l border-border-subtle transform transition-transform duration-300 ease-in-out lg:hidden
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="w-10 h-10 text-accent">
                <Logo />
              </div>
              <span className="text-xl font-bold text-foreground">depot</span>
            </Link>
            <IconButton
              onClick={closeSidebar}
              variant="ghost"
              className="!text-muted"
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
      <header className="bg-surface-base border-b border-border-subtle flex-shrink-0 z-30">
        <div className="px-4">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - logo + app name */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
              >
                <div className="w-10 h-10 text-accent">
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
                  className="lg:hidden !text-muted"
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
          <aside className="hidden lg:block w-[220px] bg-surface-muted border-r border-border-subtle flex-shrink-0">
            <div className="p-4 overflow-y-auto h-full">{sidebar}</div>
          </aside>
        )}

        {/* Main content */}
        <main id="app-content" className="flex-1 overflow-y-auto">
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
