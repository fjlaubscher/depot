import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { depot } from '@depot/core';
import type { Action } from '@/components/ui/action-group';
import { useToast } from '@/contexts/toast/use-toast-context';
import useBookmarks from './use-bookmarks';

/**
 * Returns a ready-to-use PageHeader action that toggles the given bookmark with toast feedback.
 * Pass `undefined` while the page data is still loading.
 */
export const useBookmarkAction = (bookmark: depot.Bookmark | undefined): Action => {
  const { showToast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = bookmark ? isBookmarked(bookmark.id) : false;
  const kind = bookmark?.kind ?? 'item';

  const toggle = async () => {
    if (!bookmark) return;
    try {
      const next = await toggleBookmark(bookmark);
      showToast({
        type: 'success',
        title: next ? 'Bookmarked' : 'Bookmark removed',
        message: next
          ? `${bookmark.name} pinned to your desk.`
          : `${bookmark.name} removed from bookmarks.`
      });
    } catch (err) {
      console.error(`Failed to toggle ${kind} bookmark`, err);
      showToast({
        type: 'error',
        title: 'Bookmark failed',
        message: 'Could not update bookmarks.'
      });
    }
  };

  return {
    icon: bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />,
    onClick: () => {
      void toggle();
    },
    ariaLabel: bookmarked ? 'Remove bookmark' : `Bookmark ${kind}`,
    variant: bookmarked ? 'primary' : 'ghost',
    'data-testid': `bookmark-${kind}-button`
  };
};
