import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster } from '@/test/mock-data';
import ArmiesPage from './index';

vi.mock('@/hooks/use-rosters', () => ({
  default: () => ({ rosters: [createMockRoster({ name: 'Ma liste d’essai' })], loading: false })
}));
vi.mock('@/hooks/use-collections', () => ({
  useCollections: () => ({ collections: [], loading: false })
}));

describe('ArmiesPage translations', () => {
  it('translates tiles and recent sections while preserving user and source names', async () => {
    render(<ArmiesPage />, { wrapper: TestWrapper });
    expect(screen.getByTestId('armies-tile-rosters')).toHaveTextContent('Rosters');
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByTestId('armies-tile-rosters')).toHaveTextContent('Listes');
    expect(screen.getByTestId('armies-tile-collections')).toHaveTextContent(
      'Inventaire peint et préparation.'
    );
    expect(screen.getByTestId('armies-recent-rosters')).toHaveTextContent('Listes récentes');
    expect(screen.getByText('Ma liste d’essai')).toBeInTheDocument();
    expect(document.title).toContain('Armées');
  });
});
