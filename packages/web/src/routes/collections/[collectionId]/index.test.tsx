import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { depot } from '@depot/core';

import CollectionPage from './index';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet, mockFactionIndex } from '@/test/mock-data';
import type { Action } from '@/components/ui/action-group';

vi.mock('@/components/layout', () => ({
  default: ({
    children,
    heading,
    footer,
    actions
  }: {
    children: ReactNode;
    heading?: { title: string; subtitle?: string; meta?: ReactNode };
    footer?: ReactNode;
    actions?: Action[];
  }) => (
    <div data-testid="app-layout">
      {heading?.title ? <h1>{heading.title}</h1> : null}
      {heading?.meta}
      {actions?.map((action) => (
        <button
          key={action.ariaLabel}
          type="button"
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          data-testid={action['data-testid']}
        />
      ))}
      {children}
      {footer}
    </div>
  )
}));

vi.mock('@/routes/collections/_components/collection-unit-card', () => ({
  default: ({
    unit,
    dataTestId
  }: {
    unit: { id: string; datasheet: { name: string } };
    dataTestId?: string;
  }) => <div data-testid={dataTestId}>{unit.datasheet.name}</div>
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ collectionId: 'collection-1' })
  };
});

vi.mock('@/lib/navigation', async () => {
  const actual = await vi.importActual<typeof import('@/lib/navigation')>('@/lib/navigation');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockUseCollection = vi.fn();

vi.mock('@/hooks/use-collection', () => ({
  __esModule: true,
  default: (collectionId?: string) => mockUseCollection(collectionId)
}));

const collectionUnit: depot.CollectionUnit = {
  id: 'unit-1',
  datasheet: mockDatasheet,
  datasheetSlug: mockDatasheet.slug,
  modelCost: mockDatasheet.modelCosts[0],
  selectedWargear: [],
  selectedWargearAbilities: [],
  state: 'battle-ready'
};

const collection: depot.Collection = {
  id: 'collection-1',
  name: 'My Marines',
  factionId: 'SM',
  factionSlug: 'space-marines',
  faction: mockFactionIndex,
  items: [collectionUnit],
  points: { current: 80 }
};

describe('CollectionPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseCollection.mockReset();
    mockUseCollection.mockReturnValue({
      collection,
      loading: false,
      error: null,
      save: vi.fn()
    });
  });

  it('renders units, state filters and add-units without a Lists tab', () => {
    render(
      <TestWrapper>
        <CollectionPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'My Marines' })).toBeInTheDocument();
    expect(screen.getByTestId('collection-units-section')).toBeInTheDocument();
    expect(screen.getByTestId('collection-state-filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('collection-unit-card')).toHaveTextContent('Captain');
    expect(screen.getByTestId('add-collection-units-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-roster-from-collection-button')).toBeInTheDocument();
    expect(screen.queryByTestId('collection-section-units')).not.toBeInTheDocument();
    expect(screen.queryByTestId('collection-section-lists')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /lists/i })).not.toBeInTheDocument();
  });

  it('keeps the add-units footer when the collection is empty', () => {
    mockUseCollection.mockReturnValue({
      collection: { ...collection, items: [], points: { current: 0 } },
      loading: false,
      error: null,
      save: vi.fn()
    });

    render(
      <TestWrapper>
        <CollectionPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('empty-collection-state')).toBeInTheDocument();
    expect(screen.getByTestId('add-collection-units-button')).toBeInTheDocument();
    expect(screen.queryByTestId('create-roster-from-collection-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('collection-section-lists')).not.toBeInTheDocument();
  });
});
