import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import i18n from '@/i18n';
import { useToast } from '@/contexts/toast/context';
import { useShareAction } from './use-share-action';
import { useBookmarkAction } from './use-bookmark-action';
import useBookmarks from './use-bookmarks';
import useDataVersionToast from './use-data-version-toast';

vi.mock('@/contexts/toast/context', { spy: true });
vi.mock('./use-bookmarks');

describe('common action translations', () => {
  const showToast = vi.fn();
  const toggleBookmark = vi.fn();
  const bookmark: depot.Bookmark = {
    id: 'rules',
    kind: 'faction',
    factionSlug: 'rules',
    name: 'Rules',
    createdAt: '2026-10-23'
  };

  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.mocked(useToast).mockReturnValue({ showToast, removeToast: vi.fn(), state: { toasts: [] } });
    vi.mocked(useBookmarks).mockReturnValue({
      bookmarks: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
      isBookmarked: () => false,
      toggleBookmark
    });
    toggleBookmark.mockResolvedValue(true);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });

  afterEach(() => vi.restoreAllMocks());

  it('updates a mounted share action and its clipboard notification', async () => {
    const { result } = renderHook(() => useShareAction({ url: 'https://example.test/Rules' }), {
      wrapper: TestWrapper
    });
    expect(result.current.ariaLabel).toBe('Share link');
    await act(() => i18n.changeLanguage('fr'));
    expect(result.current.ariaLabel).toBe('Partager le lien');
    act(() => result.current.onClick?.());
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Lien copié',
        message: 'Lien copié dans le presse-papiers.',
        translation: { title: 'share.linkCopied', message: 'share.copySuccess' }
      })
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.test/Rules');
  });

  it('preserves custom share labels and messages', async () => {
    await i18n.changeLanguage('fr');
    const { result } = renderHook(
      () =>
        useShareAction({
          text: 'Rules',
          ariaLabel: 'Custom share',
          copySuccessMessage: 'Custom success'
        }),
      { wrapper: TestWrapper }
    );
    expect(result.current.ariaLabel).toBe('Custom share');
    act(() => result.current.onClick?.());
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Copié',
        message: 'Custom success',
        translation: { title: 'share.copied', message: undefined }
      })
    );
  });

  it('keeps screen-specific share messages translatable after emission', async () => {
    const { result } = renderHook(() => useShareAction({ copySuccessKey: 'share.factionCopied' }), {
      wrapper: TestWrapper
    });
    act(() => result.current.onClick?.());
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Link copied',
        message: 'Faction link copied to clipboard.',
        translation: { title: 'share.linkCopied', message: 'share.factionCopied' }
      })
    );
  });

  it('translates sharing errors', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('denied'));
    await i18n.changeLanguage('fr');
    const { result } = renderHook(() => useShareAction({}), { wrapper: TestWrapper });
    act(() => result.current.onClick?.());
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Échec de la copie',
        message: 'Impossible de copier dans le presse-papiers.',
        translation: { title: 'share.copyFailed', message: 'share.copyError' }
      })
    );
  });

  it('translates bookmark labels and messages while preserving the bookmarked name', async () => {
    const { result } = renderHook(() => useBookmarkAction(bookmark), { wrapper: TestWrapper });
    expect(result.current.ariaLabel).toBe('Bookmark faction');
    await act(() => i18n.changeLanguage('fr'));
    expect(result.current.ariaLabel).toBe('Ajouter la faction aux favoris');
    act(() => result.current.onClick?.());
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Ajouté aux favoris',
        message: 'Rules ajouté à votre bureau.',
        translation: {
          title: 'bookmark.added',
          message: 'bookmark.addedMessage',
          values: { name: 'Rules' }
        }
      })
    );
    toggleBookmark.mockResolvedValue(false);
    act(() => result.current.onClick?.());
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Favori supprimé',
        message: 'Rules retiré des favoris.',
        translation: {
          title: 'bookmark.removed',
          message: 'bookmark.removedMessage',
          values: { name: 'Rules' }
        }
      })
    );
  });

  it('does not announce a data update merely because the language changes', async () => {
    const { rerender } = renderHook(({ version }) => useDataVersionToast(version), {
      wrapper: TestWrapper,
      initialProps: { version: 'v1' }
    });
    expect(showToast).not.toHaveBeenCalled();
    await act(() => i18n.changeLanguage('fr'));
    expect(showToast).not.toHaveBeenCalled();
    rerender({ version: 'v2' });
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Données de règles mises à jour',
      message: 'Version actuelle : v2.',
      translation: { title: 'data.updated', message: 'data.nowOn', values: { version: 'v2' } }
    });
  });
});
