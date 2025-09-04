import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChevronDown, FaChevronRight, FaUsers, FaCog, FaStar } from 'react-icons/fa';
import { Layout } from '../ui';
import { depot } from '@depot/core';
import useMyFactions from '@/hooks/use-my-factions';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';

interface Props {
  children: React.ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: Props) => {
  const [myFactions] = useMyFactions();
  const [isMyFactionsExpanded, setIsMyFactionsExpanded] = useState(true);
  const { closeSidebar } = useLayoutContext();

  const hasMyFactions = myFactions && myFactions.length > 0;

  const sidebar = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FaHome className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <Link
          to="/factions"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FaUsers className="h-4 w-4" />
          <span>Factions</span>
        </Link>
        <Link
          to="/settings"
          onClick={closeSidebar}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FaCog className="h-4 w-4" />
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
              {isMyFactionsExpanded ? (
                <FaChevronDown className="h-3 w-3" />
              ) : (
                <FaChevronRight className="h-3 w-3" />
              )}
            </button>

            {isMyFactionsExpanded && (
              <div className="ml-4 space-y-1">
                {myFactions.map((faction) => (
                  <Link
                    key={faction.id}
                    to={`/faction/${faction.id}`}
                    onClick={closeSidebar}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <FaStar className="h-3 w-3 text-yellow-500" />
                    <span>{faction.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <Layout title={title} sidebar={sidebar}>
      {children}
    </Layout>
  );
};

export default AppLayout;
