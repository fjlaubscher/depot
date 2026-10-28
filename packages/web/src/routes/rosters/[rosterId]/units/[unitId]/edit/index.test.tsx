import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster, createMockRosterUnit, mockEnhancement } from '@/test/mock-data';
import EditRosterUnitPage from './index';

const actions = vi.hoisted(() => ({
  updateUnitWargear: vi.fn(),
  updateUnitWargearAbilities: vi.fn(),
  updateUnitModelCost: vi.fn(),
  applyEnhancement: vi.fn(),
  removeEnhancement: vi.fn(),
  setWarlord: vi.fn()
}));
const unit = createMockRosterUnit();
const roster = createMockRoster({ units: [unit], warlordUnitId: null });
vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: ReactNode }) => children,
  useRoster: () => ({ state: roster, ...actions })
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ rosterId: roster.id, unitId: unit.id })
}));

describe('roster unit editing in both languages', () => {
  it('keeps enhancement and warlord selections through a language change before saving', async () => {
    render(<EditRosterUnitPage />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByTestId(`enhancement-option-${mockEnhancement.id}`));
    fireEvent.click(screen.getByRole('switch', { name: 'Nominate as warlord' }));
    await act(() => i18n.changeLanguage('fr'));
    expect(
      screen.getByRole('switch', { name: 'Désigner comme seigneur de guerre' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId(`enhancement-option-${mockEnhancement.id}`)).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByText(mockEnhancement.description)).toBeInTheDocument();
    expect(document.title).toContain('Modifier une unité de la liste');
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }));
    expect(actions.applyEnhancement).toHaveBeenCalledWith(mockEnhancement, unit.id);
    expect(actions.setWarlord).toHaveBeenCalledWith(unit.id);
    expect(actions.updateUnitWargear).toHaveBeenCalledWith(unit.id, unit.selectedWargear);
  });
});
