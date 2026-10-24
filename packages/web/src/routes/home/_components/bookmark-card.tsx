import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@/lib/navigation';
import type { depot } from '@depot/core';

import { bookmarkPath } from '@/utils/bookmarks';

const BookmarkCard: FC<{ bookmark: depot.Bookmark }> = ({ bookmark }) => {
  const { t } = useTranslation('home');
  return (
    <Link
      to={bookmarkPath(bookmark)}
      className="surface-card w-[150px] shrink-0 px-2.5 py-2.5 transition-colors hover:border-border-accent"
      data-testid="bookmark-card"
      data-bookmark-id={bookmark.id}
    >
      <div className="line-clamp-2 text-[12.5px] leading-tight font-bold text-foreground">
        {bookmark.name}
      </div>
      <div className="mt-1 truncate font-mono text-[9.5px] font-medium uppercase text-muted">
        {bookmark.kind === 'faction'
          ? t('bookmarkKinds.faction')
          : (bookmark.factionName ?? bookmark.factionSlug ?? t(`bookmarkKinds.${bookmark.kind}`))}
      </div>
    </Link>
  );
};

export default BookmarkCard;
