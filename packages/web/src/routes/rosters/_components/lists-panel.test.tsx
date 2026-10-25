import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { depot } from '@depot/core';

import ListsPanel from './lists-panel';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster, createMockRosterUnit } from '@/test/mock-data';

vi.mock('./create-roster-sheet', () => ({
  default: () => null
}));

const mockUseRosters = vi.hoisted(() => ({
  rosters: [] as depot.Roster[],
  loading: false,
  error: null as string | null,
  deleteRoster: vi.fn(),
  duplicateRoster: vi.fn(),
  refresh: vi.fn()
}));
vi.mock('@/hooks/use-rosters', () => ({
  default: () => mockUseRosters
}));

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

describe('ListsPanel', () => {
  beforeEach(() => {
    mockUseRosters.rosters = [];
    mockUseRosters.loading = false;
    mockUseRosters.error = null;
    mockUseCollections.collections = [];
  });

  it('shows a rosters empty state', () => {
    render(
      <TestWrapper>
        <ListsPanel />
      </TestWrapper>
    );

    expect(screen.getByTestId('empty-rosters')).toHaveTextContent('No rosters yet');
    expect(screen.queryByText('No lists yet')).not.toBeInTheDocument();
  });

  it('includes the collection name on a linked roster card', () => {
    mockUseRosters.rosters = [createMockRoster({ collectionId: 'collection-1' })];
    mockUseCollections.collections = [
      {
        id: 'collection-1',
        name: 'My Marines',
        factionId: 'SM',
        items: [],
        points: { current: 0 }
      }
    ];

    render(
      <TestWrapper>
        <ListsPanel />
      </TestWrapper>
    );

    expect(screen.getByTestId('roster-card')).toHaveTextContent('My Marines');
  });
  it.each([0, 1, 2])(
    'translates cards containing %i units and keeps names and actions',
    async (count) => {
      mockUseRosters.rosters = [
        createMockRoster({
          name: 'Ma liste d’essai',
          units: Array.from({ length: count }, (_, index) =>
            createMockRosterUnit({ id: String(index) })
          )
        })
      ];
      mockUseRosters.duplicateRoster.mockResolvedValue(
        createMockRoster({ name: 'Ma liste d’essai (Copie)' })
      );
      render(<ListsPanel />, { wrapper: TestWrapper });
      await act(() => i18n.changeLanguage('fr'));
      expect(screen.getByTestId('roster-card')).toHaveTextContent(
        `${count} unité${count > 1 ? 's' : ''}`
      );
      expect(screen.getByRole('heading', { name: 'Ma liste d’essai' })).toBeInTheDocument();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      fireEvent.click(screen.getByRole('button', { name: 'Supprimer la liste' }));
      expect(mockUseRosters.deleteRoster).not.toHaveBeenCalled();
      confirm.mockReturnValue(true);
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Supprimer la liste' }))
      );
      expect(mockUseRosters.deleteRoster).toHaveBeenCalledWith(mockUseRosters.rosters[0].id);
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Dupliquer la liste' }))
      );
      expect(mockUseRosters.duplicateRoster).toHaveBeenCalledWith(
        mockUseRosters.rosters[0],
        mockUseRosters.rosters[0].dataVersion
      );
      confirm.mockRestore();
    }
  );

  it('translates loading, empty and known failure states without displaying technical messages', async () => {
    mockUseRosters.loading = true;
    const { rerender } = render(<ListsPanel />, { wrapper: TestWrapper });
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByRole('status', { name: 'Chargement…' })).toBeInTheDocument();
    mockUseRosters.loading = false;
    rerender(<ListsPanel />);
    expect(screen.getByTestId('empty-rosters')).toHaveTextContent('Aucune liste pour le moment');
    mockUseRosters.error = 'Internal database details';
    rerender(<ListsPanel />);
    expect(screen.getByText('Impossible de charger les listes')).toBeInTheDocument();
    expect(screen.queryByText('Internal database details')).not.toBeInTheDocument();
  });
});
