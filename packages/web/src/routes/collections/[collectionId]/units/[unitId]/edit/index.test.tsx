import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CollectionUnitEditPage from './index';
import { TestWrapper } from '@/test/test-utils';
import { createMockDatasheet, createMockWargearAbility, mockFactionIndex } from '@/test/mock-data';
import type { depot } from '@depot/core';

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
    useParams: () => ({ collectionId: 'collection-1', unitId: 'unit-1' }),
    useNavigate: () => mockNavigate
  };
});

const mockUseCollection = vi.fn();

vi.mock('@/hooks/use-collection', () => ({
  __esModule: true,
  default: (collectionId?: string) => mockUseCollection(collectionId)
}));

describe('CollectionUnitEditPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseCollection.mockReset();
  });

  it('shows the unit state tag and selected wargear ability tags', () => {
    const wargearAbility = createMockWargearAbility({
      id: 'wg-ability',
      name: 'Blade Storm',
      description: 'Cutting edge.',
      type: 'Wargear'
    });

    const datasheet = createMockDatasheet({ abilities: [wargearAbility] });

    const collectionUnit: depot.CollectionUnit = {
      id: 'unit-1',
      datasheet,
      datasheetSlug: datasheet.slug,
      modelCost: datasheet.modelCosts[0],
      selectedWargear: datasheet.wargear,
      selectedWargearAbilities: [wargearAbility],
      state: 'battle-ready'
    };

    const collection: depot.Collection = {
      id: 'collection-1',
      name: 'My Collection',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: mockFactionIndex,
      items: [collectionUnit],
      points: { current: 0 }
    };

    mockUseCollection.mockReturnValue({ collection, loading: false, error: null, save: vi.fn() });

    render(<CollectionUnitEditPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('collection-unit-state-tag')).toHaveTextContent('Battle Ready');
    expect(screen.getByTestId('selected-wargear-ability-tags')).toHaveTextContent('Blade Storm');
  });
});
