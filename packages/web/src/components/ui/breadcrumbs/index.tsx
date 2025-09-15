import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem, generateBreadcrumbs } from '@/utils/breadcrumbs';

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [], className = '' }) => {
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
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        aria-label="Home"
      >
        <Home size={16} />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          <ChevronRight size={12} className="mx-2 text-gray-400 dark:text-gray-500" />
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          ) : (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
