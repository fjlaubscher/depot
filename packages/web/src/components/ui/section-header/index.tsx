import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  /** Right-hand meta — a count, or something denser like `3 · 195 PTS`. */
  count?: ReactNode;
  viewAllTo?: string;
  viewAllLabel?: string;
  viewAllTestId?: string;
}

/** `// TITLE ─────── meta` — the rule that separates every section in the app. */
const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  count,
  viewAllTo,
  viewAllLabel = 'All →',
  viewAllTestId
}) => (
  <div className="flex items-center gap-2">
    <h2 className="type-section shrink-0">
      <span aria-hidden="true">// </span>
      {title}
    </h2>
    <div className="h-px flex-1 bg-border-subtle" />
    {count !== undefined && count !== null ? (
      <span className="type-label" data-testid="section-count">
        {count}
      </span>
    ) : null}
    {viewAllTo ? (
      <Link to={viewAllTo} className="type-label hover:text-accent" data-testid={viewAllTestId}>
        {viewAllLabel}
      </Link>
    ) : null}
  </div>
);

export default SectionHeader;
