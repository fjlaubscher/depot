import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster, mockFactionManifest } from '@/test/mock-data';
import RosterDetailsPage from './index';

const updateRosterDetails = vi.hoisted(() => vi.fn());
const roster = createMockRoster({ name: 'Ma liste d’essai' });
vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: ReactNode }) => children,
  useRoster: () => ({ state: roster, updateRosterDetails })
}));
vi.mock('@/hooks/use-faction', () => ({
  default: () => ({ data: mockFactionManifest, loading: false, error: null })
}));

describe('RosterDetails translations', () => {
  it('keeps draft properties and detachment ids across a language change and validates before saving', async () => {
    render(<RosterDetailsPage />, { wrapper: TestWrapper });
    fireEvent.change(screen.getByLabelText('Roster Name'), { target: { value: 'Brouillon' } });
    fireEvent.change(screen.getByTestId('max-points-field-select'), {
      target: { value: 'custom' }
    });
    fireEvent.change(screen.getByTestId('max-points-input'), { target: { value: '1500' } });
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByLabelText('Nom de la liste')).toHaveValue('Brouillon');
    expect(screen.getByTestId('max-points-input')).toHaveValue(1500);
    expect(
      screen.getByRole('switch', {
        name: `Sélectionner ${mockFactionManifest.detachments[0].name}`
      })
    ).toHaveAttribute('aria-checked', 'true');
    expect(updateRosterDetails).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Nom de la liste'), { target: { value: ' ' } });
    expect(
      screen.getByRole('button', { name: 'Enregistrer les détails de la liste' })
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Nom de la liste'), { target: { value: 'Brouillon' } });
    fireEvent.submit(screen.getByTestId('roster-details-form'));
    expect(updateRosterDetails).toHaveBeenCalledWith({
      name: 'Brouillon',
      maxPoints: 1500,
      detachments: mockFactionManifest.detachments
    });
  });
});
