import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import classNames from 'classnames';
import Card from '../card';

export interface Badge {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

interface ContentCardProps {
  title: string;
  subtitle?: string;
  legend?: string;
  badges?: Badge[];
  actions?: ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  children?: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  'data-testid'?: string;
}

const getBadgeClasses = (variant: Badge['variant'] = 'primary', size: Badge['size'] = 'sm') => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium shrink-0';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    success: 'surface-success-strong text-success-strong',
    warning: 'surface-warning-strong text-warning-strong',
    danger: 'surface-danger-strong text-danger-strong'
  };

  return classNames(baseClasses, sizeClasses[size], variantClasses[variant]);
};

export const ContentCard: FC<ContentCardProps> = ({
  title,
  subtitle,
  legend,
  badges,
  actions,
  expandable = false,
  defaultExpanded = false,
  children,
  className,
  padding = 'md',
  onClick,
  'data-testid': dataTestId
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const handleToggleExpand = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card
      className={classNames(paddingClasses[padding], 'h-full', className)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      data-testid={dataTestId}
    >
      <div className="flex flex-col gap-3">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {title}
            </h3>
            {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
          </div>

          {/* Badges and Actions */}
          <div className="flex items-start gap-2">
            {badges && badges.length > 0 && (
              <div className="flex flex-col gap-1">
                {badges.map((badge, index) => (
                  <span key={index} className={getBadgeClasses(badge.variant, badge.size)}>
                    {badge.text}
                  </span>
                ))}
              </div>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>

        {/* Legend */}
        {legend && <div className="text-sm text-muted font-medium italic">{legend}</div>}

        {/* Expandable Toggle */}
        {expandable && (
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer self-start"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show Details
              </>
            )}
          </button>
        )}

        {/* Content */}
        {(expandable ? isExpanded : true) && children && (
          <div
            className={classNames(
              'text-sm text-body leading-relaxed',
              expandable && 'border-t border-subtle pt-3'
            )}
          >
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContentCard;
