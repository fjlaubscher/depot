import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import i18n from '@/i18n';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { slugify } from '@depot/core/utils/slug';

import CollectionUnitEditPage from './index';
import { TestWrapper } from '@/test/test-utils';
import { createMockDatasheet, createMockWargearAbility, mockFactionIndex } from '@/test/mock-data';
import type { depot } from '@depot/core';

vi.mock('@/components/layout', () => ({
  default: ({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) => (
    <div data-testid="app-layout">
      {children}
      {footer}
    </div>
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

  it('keeps unsaved state and wargear selections across language changes', async () => {
    const wargearAbility = createMockWargearAbility({
      id: 'wg-ability',
      name: 'Blade Storm',
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

    const save = vi.fn().mockResolvedValue(undefined);
    mockUseCollection.mockReturnValue({ collection, loading: false, error: null, save });

    render(<CollectionUnitEditPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('collection-unit-state-tag')).toHaveTextContent('Battle Ready');
    const abilityTestId = `wargear-ability-pill-${slugify('Blade Storm')}`;
    expect(screen.getByTestId(abilityTestId)).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByLabelText('Build state'), { target: { value: 'parade-ready' } });
    fireEvent.click(screen.getByTestId(abilityTestId));
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByLabelText('État de montage')).toHaveValue('parade-ready');
    expect(screen.getByTestId('collection-unit-state-tag')).toHaveTextContent('Pour Exposition');
    expect(screen.getByTestId(abilityTestId)).toHaveAttribute('aria-pressed', 'false');
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('save-button'));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ state: 'parade-ready', selectedWargearAbilities: [] })]
      })
    );
  });

  it('localizes the missing unit error', async () => {
    mockUseCollection.mockReturnValue({
      collection: { id: 'collection-1', items: [] },
      loading: false,
      error: null,
      save: vi.fn()
    });
    render(<CollectionUnitEditPage />, { wrapper: TestWrapper });
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByTestId('edit-collection-unit-not-found')).toHaveTextContent(
      'Unité introuvable'
    );
  });
});
