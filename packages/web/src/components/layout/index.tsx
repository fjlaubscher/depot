import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronDown, ChevronRight, Users, Settings, Star, List } from 'lucide-react';

import { useAppContext } from '@/contexts/app/use-app-context';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';

import { Layout } from '../ui';

interface Props {
  children: React.ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: Props) => {
  const { state } = useAppContext();
  const [isMyFactionsExpanded, setIsMyFactionsExpanded] = useState(true);
  const { closeSidebar } = useLayoutContext();
  const appVersion = import.meta.env.VITE_APP_VERSION?.trim() || 'dev';

  const hasMyFactions = state.myFactions && state.myFactions.length > 0;

  const sidebar = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Home size={16} />
          <span>Home</span>
        </Link>
        <Link
          to="/factions"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Users size={16} />
          <span>Factions</span>
        </Link>
        <Link
          to="/rosters"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <List size={16} />
          <span>Rosters</span>
        </Link>
        <Link
          to="/settings"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </div>

      {hasMyFactions && (
        <>
          <hr className="my-4 border-gray-200 dark:border-gray-600" />

          <div className="space-y-2">
            <button
              onClick={() => setIsMyFactionsExpanded(!isMyFactionsExpanded)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>My Factions</span>
              {isMyFactionsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            {isMyFactionsExpanded && (
              <div className="ml-4 space-y-1">
                {state.myFactions.map((faction) => (
                  <Link
                    key={faction.slug}
                    to={`/faction/${faction.slug}`}
                    onClick={closeSidebar}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span>{faction.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-2">
        <span>
          <span className="font-semibold text-gray-600 dark:text-gray-300">depot </span>
          <span>v{appVersion}</span>
        </span>
        <Link
          to="/privacy"
          onClick={closeSidebar}
          className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 underline"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );

  return (
    <Layout title={title} sidebar={sidebar}>
      {children}
    </Layout>
  );
};

export default AppLayout;
