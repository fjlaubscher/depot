import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { createMockDatasheet } from '@/test/mock-data';
import DatasheetProfile from './datasheet-profile';

const mockModelStatsRow = vi.fn();

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
  ModelStatsRow: (props: { model: unknown; variant?: string }) => {
    mockModelStatsRow(props);
    return (
      <div data-testid="model-stats-row" data-variant={props.variant || 'default'}>
        Model Row
      </div>
    );
  }
}));

describe('DatasheetProfile', () => {
  beforeEach(() => {
    mockModelStatsRow.mockClear();
  });

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

    expect(screen.getByTestId('datasheet-leader-rules')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-wargear')).toBeInTheDocument();
  });

  it('hides abilities when none are available', () => {
    const datasheet = createMockDatasheet({ abilities: [] });

    render(<DatasheetProfile datasheet={datasheet} factionDatasheets={[datasheet]} />);

    expect(screen.queryByTestId('datasheet-abilities')).not.toBeInTheDocument();
  });

  it('renders model rows using the default variant', () => {
    const datasheet = createMockDatasheet({
      models: [
        {
          line: '1',
          datasheetId: 'model-1',
          name: 'Test Model',
          baseSize: '32mm',
          baseSizeDescr: '',
          m: '6"',
          t: '4',
          sv: '3+',
          w: '2',
          ld: '6+',
          oc: '1',
          invSv: '-',
          invSvDescr: ''
        }
      ]
    });

    render(<DatasheetProfile datasheet={datasheet} factionDatasheets={[datasheet]} />);

    expect(screen.getByTestId('model-stats-row')).toHaveAttribute('data-variant', 'default');
    expect(mockModelStatsRow).toHaveBeenCalledWith(expect.objectContaining({ variant: 'default' }));
  });
});
