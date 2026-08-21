import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Users } from 'lucide-react';
import type { depot } from '@depot/core';

import { bookmarkPath } from '@/utils/bookmarks';

interface BookmarkCardProps {
  bookmark: depot.Bookmark;
}

const BookmarkCard: FC<BookmarkCardProps> = ({ bookmark }) => {
  const isFaction = bookmark.kind === 'faction';
  const Icon = isFaction ? Users : bookmark.kind === 'detachment' ? Shield : FileText;

  return (
    <Link
      to={bookmarkPath(bookmark)}
      className="inline-flex max-w-full items-center gap-2 rounded-sm surface-card border border-border-subtle px-3 py-2 text-decoration-none transition hover:border-accent-500"
      data-testid="bookmark-card"
      data-bookmark-id={bookmark.id}
    >
      <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span className="truncate text-sm font-medium text-foreground">{bookmark.name}</span>
      <span className="truncate text-xs text-muted">
        {isFaction ? 'Faction' : (bookmark.factionName ?? bookmark.factionSlug)}
      </span>
    </Link>
  );
};

export default BookmarkCard;
