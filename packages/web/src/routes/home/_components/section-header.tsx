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
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? <Icon size={18} className="shrink-0 text-muted" aria-hidden /> : null}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {typeof count === 'number' ? (
          <span className="text-sm tabular-nums text-muted" data-testid="section-count">
            {count}
          </span>
        ) : null}
      </div>
      {viewAllTo ? (
        <Link
          to={viewAllTo}
          className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
          data-testid={viewAllTestId}
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default SectionHeader;
