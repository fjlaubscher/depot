import type { ReactNode } from 'react';
import { Link, NavLink } from '@/lib/navigation';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home, BookOpen, Settings, Swords, WifiOff } from 'lucide-react';

import Logo from '@/components/logo';
import AppVersion from '@/components/shared/app-version';
import DataVersion from '@/components/shared/data-version';
import ActionGroup from '@/components/ui/action-group';
import type { Action } from '@/components/ui/action-group';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useFactionsContext } from '@/contexts/factions/context';
import useMediaQuery from '@/hooks/use-media-query';
import useOnlineStatus from '@/hooks/use-online-status';
import useDataVersionToast from '@/hooks/use-data-version-toast';
import { cx } from '@/utils/cx';
import { resolveAncestors, type AppCrumb } from './crumbs';

export type { AppCrumb };
export { resolveAncestors };

const NAV_ITEMS: {
  to: string;
  icon: typeof Home;
  label: string;
  end?: boolean;
  match?: (pathname: string) => boolean;
}[] = [
  { to: '/', icon: Home, label: 'Home', end: true },
  {
    to: '/factions',
    icon: BookOpen,
    label: 'Rules',
    match: (pathname) => pathname.startsWith('/factions') || pathname.startsWith('/faction/')
  },
  {
    to: '/armies',
    icon: Swords,
    label: 'Armies',
    match: (pathname) =>
      pathname.startsWith('/armies') ||
      pathname.startsWith('/collections') ||
      pathname.startsWith('/rosters')
  },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

const Brand = () => (
  <Link to="/" className="flex items-center gap-2 min-w-0">
    <span className="grid place-items-center size-6 rounded-xs bg-accent-600 dark:bg-accent-500 text-white">
      <Logo />
    </span>
    <span className="text-base font-bold text-foreground">depot</span>
  </Link>
);

interface Props {
  children: ReactNode;
  /** Document title. */
  title: string;
  /**
   * Drill-in screens pass this and get a sticky back header instead of the
   * bottom tab bar — the root tabs keep the bar.
   */
  back?: { to: string; label: string };
  heading?: { title: string; subtitle?: string; meta?: ReactNode };
  /** Icon buttons pinned to the right of the back header / desktop bar. */
  actions?: Action[];
  /** Sticky bottom action bar (primary CTA + secondary). */
  footer?: ReactNode;
  /** Ancestor crumbs for the desktop bar (current page is the heading, not a crumb). */
  crumbs?: AppCrumb[];
  /** Non-icon CTAs (Import, New). Placed in the desktop bar / mobile heading row. */
  toolbar?: ReactNode;
}

const Breadcrumbs = ({ crumbs }: { crumbs: AppCrumb[] }) => (
  <nav aria-label="Breadcrumb" className="min-w-0">
    <ol className="flex min-w-0 items-center gap-1">
      {crumbs.map((crumb, index) => (
        <li key={`${crumb.label}-${index}`} className="flex shrink-0 items-center gap-1">
          {index > 0 ? <ChevronRight size={12} className="flex-none text-muted" /> : null}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="truncate text-[12px] font-medium text-muted hover:text-foreground"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="truncate text-[12px] font-medium text-muted">{crumb.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const PageHeading = ({
  heading,
  titleClassName,
  className,
  align
}: {
  heading: NonNullable<Props['heading']>;
  titleClassName: string;
  className?: string;
  align?: 'left' | 'center';
}) => (
  <div className={cx('min-w-0 flex-1', className)} data-testid="page-header">
    <div className={cx('flex min-w-0 flex-col', align === 'center' && 'items-center text-center')}>
      <h1 className={cx('min-w-0 truncate font-bold text-foreground', titleClassName)}>
        {heading.title}
      </h1>
      {heading.subtitle ? (
        <p className="min-w-0 truncate font-mono text-[9px] leading-tight font-medium uppercase text-muted">
          {heading.subtitle}
        </p>
      ) : null}
    </div>
    {heading.meta}
  </div>
);

const ToolbarCluster = ({
  toolbar,
  actions,
  className
}: {
  toolbar?: ReactNode;
  actions?: Action[];
  className?: string;
}) => {
  const hasActions = Boolean(actions && actions.length > 0);
  if (!toolbar && !hasActions) return null;

  return (
    <div className={cx('flex flex-none items-center gap-2', className)}>
      {toolbar}
      {hasActions && actions ? (
        <ActionGroup actions={actions} spacing="tight" className="flex-none" />
      ) : null}
    </div>
  );
};

const AppLayout = ({ children, title, back, heading, actions, footer, crumbs, toolbar }: Props) => {
  const { dataVersion } = useFactionsContext();
  const online = useOnlineStatus();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useDocumentTitle(title);
  useDataVersionToast(dataVersion);

  const ancestors = resolveAncestors({ crumbs, back, heading, title });
  const hasActions = Boolean(actions && actions.length > 0);
  const showDesktopBar =
    isDesktop && (ancestors.length > 0 || Boolean(heading) || Boolean(toolbar) || hasActions);
  const showMobileRootRow = !back && !isDesktop && Boolean(heading || toolbar);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-surface-base">
      {/* Desktop nav rail */}
      <aside className="hidden lg:flex w-[220px] flex-none flex-col gap-0.5 border-r border-border-subtle bg-surface-muted px-2 py-4">
        <div className="px-2.5 pb-3.5">
          <Brand />
        </div>
        <nav aria-label="Primary" className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end, match }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-2.5 h-10 px-2.5 text-[13px] font-bold border-l-2 transition-colors',
                  (match ? match(pathname) : isActive)
                    ? 'border-border-accent bg-surface-accent text-accent'
                    : 'border-transparent text-muted hover:text-foreground'
                )
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 px-2.5 pt-4">
          <Link to="/about" className="link-subtle text-xs">
            About
          </Link>
          <Link to="/privacy" className="link-subtle text-xs">
            Privacy
          </Link>
          <AppVersion className="pt-1" />
          <DataVersion />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!online && (
          <div
            className="flex flex-none items-center gap-2 border-b border-warning-border bg-warning-surface px-4 py-2"
            data-testid="offline-banner"
          >
            <WifiOff size={14} className="shrink-0 text-warning-fg" />
            <p className="text-xs leading-snug text-body">
              <span className="font-bold text-warning-fg">Offline</span> — everything still works ·
              data {dataVersion ?? 'unknown'}
            </p>
          </div>
        )}

        {back && !isDesktop && (
          <header className="relative flex min-h-[52px] flex-none items-center gap-0.5 border-b border-border-subtle bg-surface-base px-1.5 py-1">
            <Link
              to={back.to}
              aria-label={`Back to ${back.label}`}
              title={`Back to ${back.label}`}
              data-testid="mobile-back-button"
              className="relative z-10 grid place-items-center size-11 flex-none text-body hover:text-foreground rounded-sm focus-ring-primary"
            >
              <ArrowLeft size={18} />
            </Link>
            {heading && (
              <div className="pointer-events-none absolute inset-x-12 inset-y-0 flex items-center justify-center">
                <PageHeading
                  heading={heading}
                  titleClassName="text-[15px] leading-tight"
                  className="text-center"
                  align="center"
                />
              </div>
            )}
            <ToolbarCluster toolbar={toolbar} actions={actions} className="relative z-10 ml-auto" />
          </header>
        )}

        {showDesktopBar && (
          <header
            data-testid="desktop-top-bar"
            className="flex flex-none flex-col gap-1.5 border-b border-border-subtle bg-surface-base px-4 py-2.5"
          >
            {ancestors.length > 0 ? <Breadcrumbs crumbs={ancestors} /> : null}
            {heading || toolbar || hasActions ? (
              <div className="flex items-start gap-2">
                {heading ? (
                  <PageHeading heading={heading} titleClassName="text-[17px] leading-tight" />
                ) : null}
                <ToolbarCluster
                  toolbar={toolbar}
                  actions={actions}
                  className="ml-auto self-center"
                />
              </div>
            ) : null}
          </header>
        )}

        <main id="app-content" className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[960px] px-4 py-4">
            {showMobileRootRow && (
              <div
                className={cx(
                  'mb-4 flex gap-2',
                  heading ? 'items-start justify-between' : 'items-center justify-end'
                )}
              >
                {heading ? <PageHeading heading={heading} titleClassName="text-2xl" /> : null}
                <ToolbarCluster toolbar={toolbar} actions={actions} />
              </div>
            )}
            {children}
          </div>
        </main>

        {footer && (
          <div className="flex flex-none gap-1 border-t border-border-subtle bg-surface-muted px-4 pt-2.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}

        {!back && (
          <nav
            aria-label="Primary"
            className="flex flex-none border-t border-border-subtle bg-surface-muted pt-1.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden"
          >
            {NAV_ITEMS.map(({ to, icon: Icon, label, end, match }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex flex-1 flex-col items-center justify-center gap-0.5 min-h-11 font-mono text-[9px] font-medium uppercase tracking-wide',
                    (match ? match(pathname) : isActive) ? 'text-accent' : 'text-subtle'
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
