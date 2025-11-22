import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Settings, ClipboardList, Boxes } from 'lucide-react';

import { useAppContext } from '@/contexts/app/use-app-context';
import { useLayoutContext } from '@/contexts/layout/use-layout-context';

import { Layout } from '../ui';

interface Props {
  children: React.ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: Props) => {
  const { state } = useAppContext();
  const { closeSidebar } = useLayoutContext();
  const appVersion = import.meta.env.VITE_APP_VERSION?.trim() || 'dev';
  const collectionLabel =
    (state.settings?.usePileOfShameLabel ?? true) ? 'Pile of Shame' : 'Collections';

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
        <Link to="/collections" onClick={closeSidebar} className="sidebar-item">
          <Boxes size={16} />
          <span>{collectionLabel}</span>
        </Link>
        <Link to="/settings" onClick={closeSidebar} className="sidebar-item">
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </div>

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
