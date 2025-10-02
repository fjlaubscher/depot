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

describe('DatasheetProfile', () => {
  it('renders core and unit abilities as tags', () => {
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

    render(<DatasheetProfile datasheet={datasheet} />);

    expect(screen.getAllByText(/click a tag to view full rules/i)).toHaveLength(2);
    expect(screen.getByTestId('core-abilities')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /leader/i })).toBeInTheDocument();

    expect(screen.getByTestId('unit-abilities')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rapid assault/i })).toBeInTheDocument();
  });

  it('shows empty message when no core abilities available', () => {
    const datasheet = createMockDatasheet({
      abilities: [
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

    render(<DatasheetProfile datasheet={datasheet} />);

    expect(screen.queryByTestId('core-abilities')).not.toBeInTheDocument();
    expect(screen.getByTestId('unit-abilities')).toBeInTheDocument();
    expect(screen.getByText(/click a tag to view full rules/i)).toBeInTheDocument();
  });
});
