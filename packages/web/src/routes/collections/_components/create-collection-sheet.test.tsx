import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { mockFactionIndex } from '@/test/mock-data';
import { offlineStorage } from '@/data/offline-storage';
import CreateCollectionSheet from './create-collection-sheet';

const showToast = vi.hoisted(() => vi.fn());
vi.mock('@/contexts/toast/context', async () => ({
  ...(await vi.importActual('@/contexts/toast/context')),
  useToast: () => ({ showToast })
}));

vi.mock('@/contexts/factions/context', async () => ({
  ...(await vi.importActual('@/contexts/factions/context')),
  useFactionsContext: () => ({
    factionIndex: [mockFactionIndex],
    loading: false,
    dataVersion: 'v1'
  })
}));

it('keeps name and faction on language change and saves unchanged user input', async () => {
  const save = vi.spyOn(offlineStorage, 'saveCollection').mockResolvedValue();
  render(<CreateCollectionSheet open onClose={vi.fn()} />, { wrapper: TestWrapper });
  fireEvent.change(screen.getByTestId('collection-name-input'), {
    target: { value: 'Mes Tyranides' }
  });
  fireEvent.change(screen.getByTestId('collection-faction-field-select'), {
    target: { value: mockFactionIndex.slug }
  });
  await act(() => i18n.changeLanguage('fr'));
  expect(screen.getByLabelText('Nom')).toHaveValue('Mes Tyranides');
  expect(screen.getByTestId('collection-faction-field-select')).toHaveValue(mockFactionIndex.slug);
  expect(save).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTestId('create-collection-submit'));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Mes Tyranides', factionSlug: mockFactionIndex.slug })
    )
  );
  save.mockRestore();
});

it('localizes validation and save errors', async () => {
  const save = vi
    .spyOn(offlineStorage, 'saveCollection')
    .mockRejectedValue(new Error('technical failure'));
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<CreateCollectionSheet open onClose={vi.fn()} />, { wrapper: TestWrapper });
  await act(() => i18n.changeLanguage('fr'));
  fireEvent.submit(screen.getByTestId('collection-name-input').closest('form')!);
  expect(showToast).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'Veuillez saisir un nom et sélectionner une faction.' })
  );
  fireEvent.change(screen.getByTestId('collection-name-input'), {
    target: { value: 'Mes Tyranides' }
  });
  fireEvent.change(screen.getByTestId('collection-faction-field-select'), {
    target: { value: mockFactionIndex.slug }
  });
  fireEvent.click(screen.getByTestId('create-collection-submit'));
  await waitFor(() =>
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Impossible de créer la collection.' })
    )
  );
  expect(diagnostic).toHaveBeenCalled();
  save.mockRestore();
  diagnostic.mockRestore();
});
