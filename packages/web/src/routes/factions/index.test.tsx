import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { depot } from '@depot/core';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import Factions from './index';

const state = vi.hoisted(() => ({
  factionIndex: [
    { id: 'SM', slug: 'space-marines', name: 'Space Marines', datasheetCount: 2 },
    { id: 'TYR', slug: 'tyranids', name: 'Tyranids', datasheetCount: 1 },
    { id: 'UNKNOWN', slug: 'unaligned', name: 'Unaligned Units', datasheetCount: 0 }
  ] as depot.Index[],
  loading: false,
  error: null as string | null,
  dataVersion: null,
  checkForDataUpdates: vi.fn()
}));

vi.mock('@/contexts/factions/context', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useFactionsContext: () => state
}));

describe('Factions translations', () => {
  beforeEach(() => {
    state.error = null;
    state.loading = false;
  });

  it('translates counts and alliances while keeping source names, links and search', async () => {
    render(<Factions />, { wrapper: TestWrapper });
    expect(document.title).toContain('Browse Rules');
    expect(screen.getByRole('link', { name: /Tyranids/ })).toHaveTextContent('1 datasheet');
    await act(() => i18n.changeLanguage('fr'));
    expect(document.title).toContain('Consulter les règles');
    expect(screen.getByText('Xénos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Space Marines/ })).toHaveTextContent(
      '2 fiches techniques'
    );
    expect(screen.getByRole('link', { name: /Tyranids/ })).toHaveAttribute(
      'href',
      '/faction/tyranids'
    );

    fireEvent.change(screen.getByTestId('faction-search'), { target: { value: 'tyra' } });
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /Space Marines/ })).not.toBeInTheDocument()
    );
    await act(() => i18n.changeLanguage('en'));
    expect(screen.getByTestId('faction-search')).toHaveValue('tyra');
    expect(screen.getByRole('link', { name: /Tyranids/ })).toHaveTextContent('1 datasheet');
    fireEvent.change(screen.getByTestId('faction-search'), { target: { value: 'absent' } });
    await waitFor(() =>
      expect(screen.getByText('No factions found matching "absent"')).toBeInTheDocument()
    );
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByText('Aucune faction ne correspond à « absent »')).toBeInTheDocument();
  });

  it('translates the loading title and load failure', async () => {
    state.loading = true;
    const { rerender } = render(<Factions />, { wrapper: TestWrapper });
    expect(document.title).toContain('Factions');
    await act(() => i18n.changeLanguage('fr'));
    state.loading = false;
    state.error = 'network failure';
    rerender(<Factions />);
    expect(
      screen.getByRole('heading', { name: 'Impossible de charger les factions' })
    ).toBeInTheDocument();
    expect(document.title).toContain('Erreur');
    await act(() => i18n.changeLanguage('en'));
    expect(screen.getByRole('heading', { name: 'Failed to Load Factions' })).toBeInTheDocument();
  });
});
