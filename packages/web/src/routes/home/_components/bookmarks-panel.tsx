import type { FC, ReactNode } from 'react';

import { getImageUrl } from '@/utils/paths';

interface BookmarksPanelProps {
  children: ReactNode;
  header?: ReactNode;
}

/**
 * Atmospheric frame for the bookmarks strip, reusing the depot hero art.
 */
const BookmarksPanel: FC<BookmarksPanelProps> = ({ children, header }) => (
  <section
    className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg dark:border-gray-800"
    data-testid="bookmarks-section"
  >
    <img
      src={getImageUrl('depot-hero.jpg')}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-gray-900/75 to-primary-950/60" />
    <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-6">
      {header ?? null}
      {children}
    </div>
  </section>
);

export default BookmarksPanel;
