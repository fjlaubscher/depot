import type { FC } from 'react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@depot/core/utils/common';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (items.length === 0) {
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

      {items.map((item, index) => (
        <Fragment key={`${index}-${item.path}`}>
          <ChevronRight size={12} className="mx-2 text-hint" />
          {index === items.length - 1 ? (
            <span className="type-label text-foreground">{item.label}</span>
          ) : (
            <Link to={item.path} className="type-label hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
