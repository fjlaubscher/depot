import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { depot } from '@depot/core';

import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet, mockFactionIndex } from '@/test/mock-data';
import CollectionPage from './index';

vi.mock('@/components/layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  )
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ collectionId: 'test-collection' }),
    useNavigate: () => mockNavigate
  };
});

const mockUseCollection = vi.fn();

vi.mock('@/hooks/use-collection', () => ({
  __esModule: true,
  default: (collectionId?: string) => mockUseCollection(collectionId)
}));

type CollectionUnitOverrides = Partial<Omit<depot.CollectionUnit, 'id' | 'state'>> & {
  id: string;
  state: depot.CollectionUnitState;
};

const createCollectionUnit = ({
  id,
  state,
  ...rest
}: CollectionUnitOverrides): depot.CollectionUnit => ({
  id,
  state,
  datasheet: mockDatasheet,
  modelCost: mockDatasheet.modelCosts[0],
  selectedWargear: [],
  selectedWargearAbilities: [],
  datasheetSlug: mockDatasheet.slug,
  ...rest
});

const buildCollection = (items: depot.CollectionUnit[]): depot.Collection => ({
  id: 'collection-1',
  name: 'My Collection',
  factionId: 'SM',
  factionSlug: 'space-marines',
  faction: mockFactionIndex,
  items,
  points: { current: 0 }
});

describe('CollectionPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockUseCollection.mockReset();
  });

  it('renders state filters and tags units with their state', async () => {
    const collection = buildCollection([
      createCollectionUnit({ id: 'unit-1', state: 'sprue' }),
      createCollectionUnit({ id: 'unit-2', state: 'built' }),
      createCollectionUnit({ id: 'unit-3', state: 'battle-ready' })
    ]);

    mockUseCollection.mockReturnValue({ collection, loading: false, error: null, save: vi.fn() });

    const user = userEvent.setup();

    render(<CollectionPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('collection-state-filter-all')).toHaveTextContent('All');
    expect(screen.getByTestId('collection-state-filter-built')).toHaveTextContent('Assembled');

    expect(screen.getAllByTestId('collection-unit-card')).toHaveLength(3);

    const assembledCard = screen
      .getAllByTestId('collection-unit-card')
      .find((card) => card.getAttribute('data-state') === 'built');

    expect(assembledCard).toBeTruthy();
    expect(within(assembledCard as HTMLElement).getByText('Assembled')).toBeInTheDocument();

    await user.click(screen.getByTestId('collection-state-filter-battle-ready'));

    const filteredCards = screen.getAllByTestId('collection-unit-card');
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0]).toHaveAttribute('data-state', 'battle-ready');
  });

  it('persists the selected state filter between renders', async () => {
    const collection = buildCollection([
      createCollectionUnit({ id: 'unit-1', state: 'sprue' }),
      createCollectionUnit({ id: 'unit-2', state: 'parade-ready' })
    ]);

    mockUseCollection.mockReturnValue({ collection, loading: false, error: null, save: vi.fn() });

    const user = userEvent.setup();

    const { unmount } = render(<CollectionPage />, { wrapper: TestWrapper });

    await user.click(screen.getByTestId('collection-state-filter-parade-ready'));

    expect(localStorage.getItem('depot:tag-selection:collection-state-filter')).toBe(
      'parade-ready'
    );

    unmount();

    render(<CollectionPage />, { wrapper: TestWrapper });

    const persistedCards = screen.getAllByTestId('collection-unit-card');
    expect(persistedCards).toHaveLength(1);
    expect(persistedCards[0]).toHaveAttribute('data-state', 'parade-ready');
  });
});
