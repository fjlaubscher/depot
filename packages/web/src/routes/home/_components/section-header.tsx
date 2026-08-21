import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  count?: number;
  viewAllTo?: string;
  viewAllLabel?: string;
  viewAllTestId?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  count,
  viewAllTo,
  viewAllLabel = 'View all',
  viewAllTestId
}) => {
  return (
    <div className="flex items-center gap-2">
      {Icon ? <Icon size={14} className="shrink-0 text-accent" aria-hidden /> : null}
      <h2 className="type-section shrink-0">
        <span aria-hidden="true">// </span>
        {title}
      </h2>
      <div className="h-px flex-1 bg-border-subtle" />
      {typeof count === 'number' ? (
        <span className="type-label" data-testid="section-count">
          {count}
        </span>
      ) : null}
      {viewAllTo ? (
        <Link
          to={viewAllTo}
          className="type-label text-accent hover:underline"
          data-testid={viewAllTestId}
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default SectionHeader;
