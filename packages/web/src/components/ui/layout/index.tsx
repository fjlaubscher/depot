import React, { useEffect } from 'react';
import { FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useDocumentTitle } from '@/hooks/use-document-title';
import IconButton from '../icon-button';
import Loader from '../loader';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  sidebar?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title, sidebar }) => {
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
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
            fixed top-0 right-0 z-50 w-64 h-full bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600 dark:text-blue-400">
                <FaHome />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">depot</h2>
            </div>
            <IconButton onClick={closeSidebar} variant="ghost" aria-label="Close sidebar">
              <FaTimes />
            </IconButton>
          </div>

          {/* Sidebar content */}
          <div className="p-4 overflow-y-auto">{sidebar}</div>
        </aside>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - logo + app name */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                  <FaHome />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">depot</span>
              </div>
            </div>

            {/* Center - Title */}
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
              {title}
            </h1>

            {/* Right side - Mobile Menu */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              {sidebar && (
                <IconButton
                  onClick={toggleSidebar}
                  variant="ghost"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <FaBars />
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
          <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 overflow-y-auto h-full">{sidebar}</div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
