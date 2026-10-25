import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet, mockFactionIndex } from '@/test/mock-data';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';
import AddCollectionUnitsPage from './index';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  showToast: vi.fn(),
  missing: false,
  error: null as string | null
}));
vi.mock('@/contexts/toast/context', async () => ({
  ...(await vi.importActual('@/contexts/toast/context')),
  useToast: () => ({ showToast: mocks.showToast })
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ collectionId: 'c1' })
}));
vi.mock('@/hooks/use-collection', () => ({
  default: () => ({
    collection: mocks.missing
      ? null
      : { id: 'c1', name: 'Mes Tyranides', factionId: 'SM', faction: mockFactionIndex, items: [] },
    loading: false,
    error: mocks.error,
    save: mocks.save
  })
}));
vi.mock('@/components/shared/add-units-view', () => ({
  default: ({
    title,
    onConfirm
  }: {
    title: string;
    onConfirm: (units: SelectedUnit[], clear: () => void) => void;
  }) => (
    <>
      <h1>{title}</h1>
      <button
        onClick={() =>
          onConfirm(
            [
              { id: 'selected-1', datasheet: mockDatasheet, modelCost: mockDatasheet.modelCosts[0] }
            ],
            vi.fn()
          )
        }
      >
        confirm
      </button>
    </>
  )
}));

it.each(['en', 'fr'])('adds unchanged units with a localized %s confirmation', async (language) => {
  mocks.missing = false;
  mocks.error = null;
  mocks.save.mockResolvedValue(undefined);
  render(<AddCollectionUnitsPage />, { wrapper: TestWrapper });
  await act(() => i18n.changeLanguage(language));
  expect(
    screen.getByRole('heading', { name: language === 'fr' ? 'Ajouter des unités' : 'Add units' })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByText('confirm'));
  await waitFor(() => expect(mocks.save).toHaveBeenCalled());
  expect(mocks.save.mock.calls[0][0].items[0].modelCost).toEqual(mockDatasheet.modelCosts[0]);
  await waitFor(() =>
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: language === 'fr' ? '1 unité ajoutée' : 'Added 1 unit' })
    )
  );
});

it('localizes a missing collection and technical errors', async () => {
  mocks.missing = true;
  mocks.error = 'technical failure';
  const view = render(<AddCollectionUnitsPage />, { wrapper: TestWrapper });
  await act(() => i18n.changeLanguage('fr'));
  expect(
    screen.getByText('Impossible de charger cette collection. Veuillez réessayer.')
  ).toBeInTheDocument();
  expect(screen.queryByText('technical failure')).not.toBeInTheDocument();
  mocks.error = null;
  view.rerender(<AddCollectionUnitsPage />);
  expect(screen.getByText('Collection introuvable')).toBeInTheDocument();
});
