import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { createMockRoster } from '@/test/mock-data';
import RosterIssues from './roster-issues';

describe('RosterIssues translations', () => {
  it.each([1, 2])(
    'updates a mounted alert with %i problems without changing the roster',
    async (count) => {
      const roster = createMockRoster({
        units: [],
        detachments: [],
        points: { current: count === 2 ? 2100 : 0, max: 2000 }
      });
      const original = structuredClone(roster);
      render(<RosterIssues roster={roster} />);
      expect(screen.getByTestId('roster-issues')).toHaveTextContent(
        `${count} list legality issue${count === 1 ? '' : 's'} (Strike Force)`
      );
      await act(() => i18n.changeLanguage('fr'));
      expect(screen.getByTestId('roster-issues')).toHaveTextContent(
        `${count} problème${count === 1 ? '' : 's'} de légalité (Strike Force)`
      );
      expect(screen.getByText('Aucun détachement sélectionné.')).toBeInTheDocument();
      expect(roster).toEqual(original);
    }
  );
});
