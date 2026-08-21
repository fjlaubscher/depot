import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home, Users, Settings, ClipboardList, Boxes } from 'lucide-react';

import { useLayoutContext } from '@/contexts/layout/context';
import { cx } from '@/utils/cx';

import { Layout } from '../ui';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/collections', icon: Boxes, label: 'Collections' },
  { to: '/factions', icon: Users, label: 'Factions' },
  { to: '/rosters', icon: ClipboardList, label: 'Rosters' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

interface Props {
  children: React.ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: Props) => {
  const { closeSidebar } = useLayoutContext();
  const appVersion = import.meta.env.VITE_APP_VERSION?.trim() || 'dev';

  const sidebar = (
    <div className="space-y-4">
      <div className="space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeSidebar}
            className={({ isActive }) =>
              cx('sidebar-item', isActive && 'border-l-border-accent bg-surface-accent text-accent')
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-4 border-t border-border-subtle text-xs text-subtle flex flex-col gap-2">
        <span>
          <span className="font-semibold text-muted">depot </span>
          <span>v{appVersion}</span>
        </span>
        <Link to="/about" onClick={closeSidebar} className="link-subtle">
          About
        </Link>
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
