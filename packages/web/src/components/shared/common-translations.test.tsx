import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Toast as ToastData } from '@/contexts/toast/context';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { TestWrapper } from '@/test/test-utils';
import i18n from '@/i18n';
import {
  ErrorState,
  Filters,
  Loader,
  QuantityStepper,
  Search,
  SectionHeader,
  Sheet,
  Tabs,
  Toast
} from '@/components/ui';
import ImportButton from './import-button';
import LibraryCard from './library-card';
import { ErrorBoundary } from './error-boundary';

vi.mock('@/sentry', () => ({ Sentry: { captureException: vi.fn() } }));

describe('shared translations', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('updates generic controls, accessible labels and tooltips while mounted', async () => {
    const clear = vi.fn();
    const increase = vi.fn();
    const close = vi.fn();
    const remove = vi.fn();
    render(
      <TestWrapper>
        <Search value="Rules" clearable onChange={clear} />
        <QuantityStepper value={1} onDecrease={vi.fn()} onIncrease={increase} />
        <Sheet title="Space Marines" open onClose={close}>
          content
        </Sheet>
        <Toast toast={{ id: 'notice', title: 'Rules', type: 'info' }} onRemove={remove} />
        <Tabs tabs={['Space Marines']}>
          <p>content</p>
        </Tabs>
        <SectionHeader title="Rules" viewAllTo="/factions" />
        <Filters showClear onClear={clear}>
          filters
        </Filters>
        <ImportButton onFilesSelected={vi.fn()} />
        <Loader />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText('Search')).toHaveValue('Rules');
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByPlaceholderText('Rechercher')).toHaveValue('Rules');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(clear).toHaveBeenCalledWith('');
    const add = screen.getByRole('button', { name: 'Augmenter la quantité' });
    expect(add).toHaveAttribute('title', 'Augmenter la quantité');
    fireEvent.click(add);
    expect(increase).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(close).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer la notification' }));
    expect(remove).toHaveBeenCalledWith('notice');
    expect(screen.getByRole('navigation', { name: 'Onglets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tout voir →' })).toHaveAttribute('href', '/factions');
    expect(screen.getByRole('button', { name: 'Importer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Effacer' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Chargement…' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Space Marines' })).toBeInTheDocument();
  });

  it('keeps caller-provided labels and error messages', async () => {
    render(
      <TestWrapper>
        <Search value="" placeholder="Custom search" onChange={vi.fn()} />
        <QuantityStepper
          value={1}
          decreaseLabel="Custom decrease"
          increaseLabel="Custom increase"
          onDecrease={vi.fn()}
          onIncrease={vi.fn()}
        />
        <SectionHeader title="Custom title" viewAllTo="/factions" viewAllLabel="Custom all" />
        <ErrorState title="Custom error" message="Custom message" />
      </TestWrapper>
    );
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByPlaceholderText('Custom search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom increase' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom decrease' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Custom all' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Custom error' })).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('updates an already-visible common notification and keeps interpolated names', async () => {
    const toast = {
      id: 'bookmark',
      type: 'success',
      title: 'Bookmarked',
      message: 'Rules pinned to your desk.',
      translation: {
        title: 'bookmark.added',
        message: 'bookmark.addedMessage',
        values: { name: 'Rules' }
      }
    } as const satisfies ToastData;
    render(<Toast toast={toast} onRemove={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Rules pinned to your desk.');
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByRole('status')).toHaveTextContent('Ajouté aux favoris');
    expect(screen.getByRole('status')).toHaveTextContent('Rules ajouté à votre bureau.');
  });

  it('translates generic error recovery controls and preserves technical details', async () => {
    const retry = vi.fn();
    render(
      <TestWrapper>
        <ErrorState stackTrace="Error: Rules" onRetry={retry} />
      </TestWrapper>
    );
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByRole('heading', { name: 'Une erreur est survenue' })).toBeInTheDocument();
    expect(screen.getByText('Afficher les détails techniques')).toBeInTheDocument();
    expect(screen.getByText('Error: Rules')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute('href', '/');
  });

  it('updates an error boundary that has already caught an error', async () => {
    const Throw = () => {
      throw new Error('Rules');
    };
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <Throw />
          </ErrorBoundary>
        </TestWrapper>
      );
      expect(screen.getByRole('heading', { name: 'Application Error' })).toBeInTheDocument();
      await act(() => i18n.changeLanguage('fr'));
      expect(screen.getByRole('heading', { name: 'Erreur de l’application' })).toBeInTheDocument();
      expect(document.title).toContain('Erreur de l’application');
    } finally {
      errors.mockRestore();
    }
  });

  it.each(['roster', 'collection'])(
    'translates %s actions and confirmation without changing its name',
    async (noun) => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const onDelete = vi.fn();
      const onDuplicate = vi.fn().mockResolvedValue(undefined);
      try {
        render(
          <TestWrapper>
            <LibraryCard
              name="Rules"
              meta="Space Marines"
              points={1000}
              noun={noun}
              viewPath="/armies"
              editPath="/armies"
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              data-testid="library"
            />
          </TestWrapper>
        );
        await act(() => i18n.changeLanguage('fr'));
        const card = within(screen.getByTestId('library'));
        expect(card.getByRole('heading', { name: 'Rules' })).toBeInTheDocument();
        const item = noun === 'roster' ? 'la liste' : 'la collection';
        await act(async () =>
          fireEvent.click(card.getByRole('button', { name: `Dupliquer ${item}` }))
        );
        expect(onDuplicate).toHaveBeenCalledOnce();
        fireEvent.click(card.getByRole('button', { name: `Supprimer ${item}` }));
        expect(confirm).toHaveBeenCalledWith(
          'Voulez-vous vraiment supprimer « Rules » ? Cette action est irréversible.'
        );
        expect(onDelete).not.toHaveBeenCalled();
        confirm.mockReturnValue(true);
        await act(async () =>
          fireEvent.click(card.getByRole('button', { name: `Supprimer ${item}` }))
        );
        expect(onDelete).toHaveBeenCalledOnce();
      } finally {
        confirm.mockRestore();
      }
    }
  );
});
