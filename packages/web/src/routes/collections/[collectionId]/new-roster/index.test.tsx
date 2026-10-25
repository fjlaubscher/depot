import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet, mockFaction, mockFactionIndex } from '@/test/mock-data';
import CollectionNewRoster from './index';

const mocks = vi.hoisted(() => ({
  createRoster: vi.fn(),
  missing: false,
  empty: false,
  error: null as string | null
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ collectionId: 'c1' })
}));
vi.mock('@/hooks/use-collection', () => ({
  default: () => ({
    collection: mocks.missing
      ? null
      : {
          id: 'c1',
          name: 'Mes Tyranides',
          factionId: mockFactionIndex.id,
          factionSlug: mockFactionIndex.slug,
          faction: mockFactionIndex,
          items: mocks.empty
            ? []
            : [
                {
                  id: 'u1',
                  datasheet: mockDatasheet,
                  modelCost: mockDatasheet.modelCosts[0],
                  selectedWargear: mockDatasheet.wargear,
                  state: 'parade-ready'
                }
              ]
        },
    loading: false,
    error: mocks.error
  })
}));
vi.mock('@/contexts/factions/context', async () => ({
  ...(await vi.importActual('@/contexts/factions/context')),
  useFactionsContext: () => ({
    factionIndex: [mockFactionIndex],
    loading: false,
    dataVersion: null
  })
}));
vi.mock('@/hooks/use-faction', () => ({ default: () => ({ data: mockFaction, loading: false }) }));
vi.mock('@/contexts/roster/context', () => ({
  useRoster: () => ({ createRoster: mocks.createRoster })
}));

beforeEach(() => {
  mocks.missing = false;
  mocks.empty = false;
  mocks.error = null;
});

it.each(['en', 'fr'])('keeps selection, points and entered name in %s', async (language) => {
  render(<CollectionNewRoster />, { wrapper: TestWrapper });
  await act(() => i18n.changeLanguage(language));
  fireEvent.click(screen.getByTestId('collection-selection-u1'));
  const review = screen.getByRole('button', { name: /Review Selection|Vérifier la sélection/i });
  expect(review).toHaveTextContent(mockDatasheet.modelCosts[0].cost);
  await act(() => i18n.changeLanguage(language === 'en' ? 'fr' : 'en'));
  expect(screen.getByTestId('collection-selection-u1')).toHaveTextContent(
    language === 'en' ? 'Sélectionné' : 'Selected'
  );
  await act(() => i18n.changeLanguage(language));
  fireEvent.click(screen.getByRole('button', { name: /Review Selection|Vérifier la sélection/i }));
  fireEvent.click(
    screen.getByRole('button', { name: language === 'en' ? 'Confirm' : 'Confirmer' })
  );
  expect(screen.getByTestId('roster-name-input')).toHaveValue(
    language === 'en' ? 'Mes Tyranides roster' : 'Liste Mes Tyranides'
  );
  fireEvent.change(screen.getByTestId('roster-name-input'), { target: { value: 'Liste tournoi' } });
  await act(() => i18n.changeLanguage(language === 'en' ? 'fr' : 'en'));
  expect(screen.getByTestId('roster-name-input')).toHaveValue('Liste tournoi');
  fireEvent.change(screen.getByTestId('detachment-field-select'), {
    target: { value: mockFaction.detachments[0].slug }
  });
  fireEvent.submit(screen.getByTestId('roster-form'));
  expect(mocks.createRoster).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Liste tournoi',
      collectionId: 'c1',
      units: [
        expect.objectContaining({
          modelCost: mockDatasheet.modelCosts[0],
          selectedWargear: mockDatasheet.wargear
        })
      ]
    })
  );
});

it('translates empty and error states', async () => {
  mocks.empty = true;
  const view = render(<CollectionNewRoster />, { wrapper: TestWrapper });
  await act(() => i18n.changeLanguage('fr'));
  expect(screen.getByTestId('empty-collection-state')).toHaveTextContent(
    'Aucune unité dans cette collection'
  );
  mocks.missing = true;
  view.rerender(<CollectionNewRoster />);
  expect(screen.getByText('Collection introuvable')).toBeInTheDocument();
});
