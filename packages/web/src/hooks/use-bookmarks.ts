import { useCallback } from 'react';
import type { depot } from '@depot/core';

import { offlineStorage } from '@/data/offline-storage';
import useAsync from './use-async';

interface UseBookmarks {
  bookmarks: depot.Bookmark[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isBookmarked: (id: string) => boolean;
  addBookmark: (bookmark: depot.Bookmark) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  toggleBookmark: (bookmark: depot.Bookmark) => Promise<boolean>;
}

function useBookmarks(): UseBookmarks {
  const { data, loading, error, refresh } = useAsync(() => offlineStorage.getBookmarks(), []);

  const bookmarks = data ?? [];

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((bookmark) => bookmark.id === id),
    [bookmarks]
  );

  const addBookmark = useCallback(
    async (bookmark: depot.Bookmark) => {
      await offlineStorage.addBookmark(bookmark);
      await refresh();
    },
    [refresh]
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      await offlineStorage.removeBookmark(id);
      await refresh();
    },
    [refresh]
  );

  const toggleBookmark = useCallback(
    async (bookmark: depot.Bookmark) => {
      const nextBookmarked = await offlineStorage.toggleBookmark(bookmark);
      await refresh();
      return nextBookmarked;
    },
    [refresh]
  );

  return {
    bookmarks,
    loading,
    error,
    refresh,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark
  };
}

export default useBookmarks;
