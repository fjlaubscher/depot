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

vi.mock('@/components/shared', () => ({
  ModelStatsRow: () => <div data-testid="model-stats-row">Model Row</div>
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
    expect(coreAbilityTag.querySelector('span')).toHaveClass('bg-surface-accent');

    expect(unitAbilityTag).toBeInTheDocument();
    expect(unitAbilityTag.querySelector('span')).toHaveClass('bg-success-surface');

    expect(screen.getByTestId('datasheet-leader-rules')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-wargear')).toBeInTheDocument();
  });

  it('hides abilities when none are available', () => {
    const datasheet = createMockDatasheet({ abilities: [] });

    render(<DatasheetProfile datasheet={datasheet} factionDatasheets={[datasheet]} />);

    expect(screen.queryByTestId('datasheet-abilities')).not.toBeInTheDocument();
  });
});
