import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { depot } from '@depot/core';

import { TestWrapper } from '@/test/test-utils';
import CollectionsPage from './index';
import i18n from '@/i18n';
import { offlineStorage } from '@/data/offline-storage';
import { mockFactionIndex } from '@/test/mock-data';

const mockUseCollections = vi.hoisted(() => ({
  collections: [] as depot.Collection[],
  loading: false,
  error: null as string | null,
  refresh: vi.fn()
}));

vi.mock('@/hooks/use-collections', () => ({
  default: () => mockUseCollections,
  useCollections: () => mockUseCollections
}));

vi.mock('@/components/layout/install-banner', () => ({
  default: () => null
}));

describe('CollectionsPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    mockUseCollections.collections = [];
    mockUseCollections.loading = false;
    mockUseCollections.error = null;
  });

  it('shows Import and New on the heading row', () => {
    render(
      <TestWrapper>
        <CollectionsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByTestId('import-collection-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-collection-button')).toBeInTheDocument();
    expect(screen.getByTestId('empty-collections')).toBeInTheDocument();
  });

  it('updates the shared import action and navigation when the language changes', async () => {
    render(
      <TestWrapper>
        <CollectionsPage />
      </TestWrapper>
    );
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByTestId('empty-collections')).toHaveTextContent(
      'Aucune collection pour le moment'
    );
    expect(screen.getByTestId('create-collection-button')).toHaveAccessibleName(
      'Créer une collection'
    );
    expect(screen.getByTestId('import-collection-button')).toHaveTextContent('Importer');
    expect(
      screen
        .getAllByRole('link', { name: 'Armées' })
        .every((link) => link.getAttribute('href') === '/armies')
    ).toBe(true);
  });

  it.each([
    ['en', 'Copy'],
    ['fr', 'Copie']
  ])('duplicates with a saved %s suffix', async (language, suffix) => {
    const save = vi.spyOn(offlineStorage, 'saveCollection').mockResolvedValue();
    mockUseCollections.collections = [
      {
        id: 'c1',
        name: 'Mes Tyranides',
        factionId: 'SM',
        faction: mockFactionIndex,
        items: [],
        points: { current: 0 }
      }
    ];
    render(<CollectionsPage />, { wrapper: TestWrapper });
    await act(() => i18n.changeLanguage(language));
    fireEvent.click(
      screen.getByRole('button', {
        name: language === 'fr' ? 'Dupliquer la collection' : 'Duplicate collection'
      })
    );
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({ name: `Mes Tyranides ${suffix}` })
      )
    );
    await act(() => i18n.changeLanguage(language === 'fr' ? 'en' : 'fr'));
    expect(save).toHaveBeenCalledTimes(1);
    save.mockRestore();
  });

  it('shows a localized load error without exposing the technical message', async () => {
    mockUseCollections.error = 'technical failure';
    render(<CollectionsPage />, { wrapper: TestWrapper });
    await act(() => i18n.changeLanguage('fr'));
    expect(
      screen.getByText('Impossible de charger les collections. Veuillez réessayer.')
    ).toBeInTheDocument();
    expect(screen.queryByText('technical failure')).not.toBeInTheDocument();
  });
});
