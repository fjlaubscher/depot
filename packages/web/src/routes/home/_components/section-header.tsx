import type { FC } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface SectionHeaderProps {
  title: string;
  count?: number;
  viewAllTo?: string;
  viewAllLabel?: string;
  viewAllTestId?: string;
  /** Use on dark hero backgrounds. */
  tone?: 'default' | 'on-media';
}

const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  count,
  viewAllTo,
  viewAllLabel = 'View all',
  viewAllTestId,
  tone = 'default'
}) => {
  const onMedia = tone === 'on-media';

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2
          className={classNames(
            'text-lg font-semibold',
            onMedia ? 'text-white' : 'text-foreground'
          )}
        >
          {title}
        </h2>
        {typeof count === 'number' ? (
          <span
            className={classNames(
              'text-sm tabular-nums',
              onMedia ? 'text-white/70' : 'text-muted'
            )}
            data-testid="section-count"
          >
            {count}
          </span>
        ) : null}
      </div>
      {viewAllTo ? (
        <Link
          to={viewAllTo}
          className={classNames(
            'text-sm font-medium hover:underline',
            onMedia
              ? 'text-primary-200 hover:text-white'
              : 'text-primary-600 dark:text-primary-400'
          )}
          data-testid={viewAllTestId}
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default SectionHeader;
