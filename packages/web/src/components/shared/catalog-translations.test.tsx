import { act, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { mockDatasheet } from '@/test/mock-data';
import WargearTable from './wargear-table';

describe('catalog profile translations', () => {
  it.each([
    ['Ranged', 'BS', 'CT'],
    ['Melee', 'WS', 'CC'],
    ['Mixed', 'BS/WS', 'CT/CC']
  ] as const)(
    'translates %s weapon headers and preserves source profiles',
    async (type, englishSkill, frenchSkill) => {
      render(<WargearTable wargear={mockDatasheet.wargear} title="Weapons" type={type} />);
      const table = screen.getByRole('table');
      const headers = () =>
        within(table)
          .getAllByRole('columnheader')
          .map((cell) => cell.textContent);
      const cells = () =>
        within(table)
          .getAllByRole('cell')
          .map((cell) => cell.textContent);
      const sourceCells = cells();
      expect(headers()).toEqual(['Weapons', 'Range', 'A', englishSkill, 'S', 'AP', 'D']);

      await act(() => i18n.changeLanguage('fr'));
      expect(headers()).toEqual(['Weapons', 'Portée', 'A', frenchSkill, 'F', 'PA', 'D']);
      expect(cells()).toEqual(sourceCells);

      await act(() => i18n.changeLanguage('en'));
      expect(headers()).toEqual(['Weapons', 'Range', 'A', englishSkill, 'S', 'AP', 'D']);
    }
  );
});
