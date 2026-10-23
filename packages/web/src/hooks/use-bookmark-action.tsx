import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { depot } from '@depot/core';
import type { Action } from '@/components/ui/action-group';
import { useToast } from '@/contexts/toast/context';
import useBookmarks from './use-bookmarks';

/**
 * Returns a ready-to-use PageHeader action that toggles the given bookmark with toast feedback.
 * Pass `undefined` while the page data is still loading.
 */
export const useBookmarkAction = (bookmark: depot.Bookmark | undefined): Action => {
  const { t } = useTranslation('common');
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
        title: next ? t('bookmark.added') : t('bookmark.removed'),
        message: next
          ? t('bookmark.addedMessage', { name: bookmark.name })
          : t('bookmark.removedMessage', { name: bookmark.name }),
        translation: {
          title: next ? 'bookmark.added' : 'bookmark.removed',
          message: next ? 'bookmark.addedMessage' : 'bookmark.removedMessage',
          values: { name: bookmark.name }
        }
      });
    } catch (err) {
      console.error(`Failed to toggle ${kind} bookmark`, err);
      showToast({
        type: 'error',
        title: t('bookmark.failed'),
        message: t('bookmark.error'),
        translation: { title: 'bookmark.failed', message: 'bookmark.error' }
      });
    }
  };

  return {
    icon: bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />,
    onClick: () => {
      void toggle();
    },
    ariaLabel: bookmarked ? t('bookmark.remove') : t(`bookmark.add.${kind}`),
    variant: bookmarked ? 'primary' : 'ghost',
    'data-testid': `bookmark-${kind}-button`
  };
};
