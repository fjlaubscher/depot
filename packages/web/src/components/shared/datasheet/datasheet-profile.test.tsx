import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { createMockDatasheet } from '@/test/mock-data';
import DatasheetProfile from './datasheet-profile';

vi.mock('./datasheet-hero', () => ({
  default: () => <div data-testid="datasheet-hero">Hero</div>
}));

vi.mock('./datasheet-wargear', () => ({
  default: () => <div data-testid="datasheet-wargear">Wargear</div>
}));

vi.mock('./datasheet-leader-rules', () => ({
  default: () => <div data-testid="datasheet-leader-rules">Leader Rules</div>
}));

describe('DatasheetProfile', () => {
  it('renders combined abilities with type-specific tag styles', () => {
    const datasheet = createMockDatasheet({
      abilities: [
        {
          id: 'core-1',
          name: 'Leader',
          legend: '',
          factionId: 'SM',
          description: '<p>Leader description</p>',
          type: 'Core'
        },
        {
          id: 'inline-1',
          name: 'Rapid Assault',
          legend: '',
          factionId: 'SM',
          description: '<p>Rapid assault description</p>',
          type: 'Datasheet'
        }
      ]
    });

    render(<DatasheetProfile datasheet={datasheet} factionDatasheets={[datasheet]} />);

    expect(screen.getByTestId('datasheet-abilities')).toBeInTheDocument();
    expect(screen.getByText(/click a tag to view full rules/i)).toBeInTheDocument();

    const coreAbilityTag = screen.getByTestId('datasheet-abilities-tag-core-1');
    const unitAbilityTag = screen.getByTestId('datasheet-abilities-tag-inline-1');

    expect(coreAbilityTag).toBeInTheDocument();
    expect(coreAbilityTag.querySelector('span')).toHaveClass('bg-primary-100');

    expect(unitAbilityTag).toBeInTheDocument();
    expect(unitAbilityTag.querySelector('span')).toHaveClass('surface-success-strong');
  });

  it('hides abilities when none are available', () => {
    const datasheet = createMockDatasheet({ abilities: [] });

    render(<DatasheetProfile datasheet={datasheet} factionDatasheets={[datasheet]} />);

    expect(screen.queryByTestId('datasheet-abilities')).not.toBeInTheDocument();
  });
});
