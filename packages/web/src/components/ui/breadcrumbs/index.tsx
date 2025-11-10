import type { FC } from 'react';
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@/utils/breadcrumbs';
import { generateBreadcrumbs } from '@/utils/breadcrumbs';

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ items = [], className = '' }) => {
  const location = useLocation();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  // Auto-generate breadcrumbs from URL if no items provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs(location.pathname);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
      data-testid="breadcrumbs"
    >
      <Link
        to="/"
        className="text-subtle hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home size={16} />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <Fragment key={item.path}>
          <ChevronRight size={12} className="mx-2 text-hint" />
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link to={item.path} className="text-subtle hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
