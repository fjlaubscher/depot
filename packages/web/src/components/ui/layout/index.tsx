import React, { useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useDocumentTitle } from '@/hooks/use-document-title';
import IconButton from '../icon-button';
import Loader from '../loader';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  home?: React.ReactNode;
  isLoading?: boolean;
  sidebar?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  action,
  home,
  isLoading = false,
  sidebar
}) => {
  const { state, closeSidebar, toggleSidebar } = useLayoutContext();
  const { sidebarOpen } = state;
  
  // Set document title
  useDocumentTitle(`${title} | depot`);

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      {sidebar && (
        <aside
          className={`
            fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <IconButton onClick={closeSidebar} variant="ghost" aria-label="Close sidebar">
              <FaTimes />
            </IconButton>
          </div>

          {/* Sidebar content */}
          <div className="p-4 overflow-y-auto">{sidebar}</div>
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side - mobile menu + home */}
              <div className="flex items-center space-x-4">
                {sidebar && (
                  <IconButton
                    onClick={toggleSidebar}
                    variant="ghost"
                    className="lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <FaBars />
                  </IconButton>
                )}

                {home && (
                  <div className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                    {home}
                  </div>
                )}
              </div>

              {/* Center - Title */}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-4 flex-1 text-center lg:text-left">
                {title}
              </h1>

              {/* Right side - Action */}
              <div className="flex items-center">{action}</div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
