import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  Star,
  ClipboardList
} from 'lucide-react';

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
        <Link to="/" onClick={closeSidebar} className="sidebar-item">
          <Home size={16} />
          <span>Home</span>
        </Link>
        <Link to="/factions" onClick={closeSidebar} className="sidebar-item">
          <Users size={16} />
          <span>Factions</span>
        </Link>
        <Link to="/rosters" onClick={closeSidebar} className="sidebar-item">
          <ClipboardList size={16} />
          <span>Rosters</span>
        </Link>
        <Link to="/settings" onClick={closeSidebar} className="sidebar-item">
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
              className="sidebar-item w-full justify-between font-medium text-foreground"
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
                    className="sidebar-sub-item"
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

      <div className="pt-4 border-t border-subtle text-xs text-subtle flex flex-col gap-2">
        <span>
          <span className="font-semibold text-muted">depot </span>
          <span>v{appVersion}</span>
        </span>
        <Link to="/privacy" onClick={closeSidebar} className="link-subtle">
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
