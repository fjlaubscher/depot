import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, FileText, Shield, Users } from 'lucide-react';
import type { depot } from '@depot/core';

import { bookmarkPath } from '@/utils/bookmarks';

interface BookmarkCardProps {
  bookmark: depot.Bookmark;
}

const BookmarkCard: FC<BookmarkCardProps> = ({ bookmark }) => {
  const path = bookmarkPath(bookmark);
  const isFaction = bookmark.kind === 'faction';
  const Icon = isFaction ? Users : bookmark.kind === 'detachment' ? Shield : FileText;

  return (
    <Link
      to={path}
      className="group/link block h-full text-decoration-none"
      data-testid="bookmark-card"
      data-bookmark-id={bookmark.id}
    >
      <div
        className={`
          flex h-full min-h-[112px] flex-col justify-between gap-2 rounded-xl border border-white/15
          bg-white/10 p-4 text-white shadow-lg shadow-primary-900/20 backdrop-blur-sm transition
          hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline focus-visible:outline-offset-2
          focus-visible:outline-white
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition group-hover/link:bg-white/25">
            <Icon className="h-5 w-5" />
          </span>
          <Bookmark className="h-4 w-4 shrink-0 fill-white/90 text-white/90" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-base font-semibold text-white">{bookmark.name}</span>
          <span className="truncate text-xs text-white/75">
            {isFaction ? 'Faction' : (bookmark.factionName ?? bookmark.factionSlug)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookmarkCard;
