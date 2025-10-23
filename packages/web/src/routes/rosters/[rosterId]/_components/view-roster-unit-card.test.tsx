import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestWrapper } from '@/test/test-utils';
import { createMockRosterUnit, createMockDatasheet, mockDatasheet } from '@/test/mock-data';
import ViewRosterUnitCard from './view-roster-unit-card';

describe('ViewRosterUnitCard', () => {
  it('toggles tag visibility when expanded', () => {
    const datasheetWithInlineAbility = createMockDatasheet({
      abilities: [
        ...mockDatasheet.abilities,
        {
          id: 'shock-assault',
          name: 'Shock Assault',
          legend: '',
          factionId: 'SM',
          description: 'Test inline ability',
          type: 'Datasheet'
        }
      ]
    });

    const unit = createMockRosterUnit({
      datasheet: datasheetWithInlineAbility,
      modelCost: datasheetWithInlineAbility.modelCosts[0],
      selectedWargear: [
        {
          ...mockDatasheet.wargear[0],
          name: 'Relic Blade'
        }
      ]
    });

    render(<ViewRosterUnitCard unit={unit} />, { wrapper: TestWrapper });

    expect(screen.getByText('Abilities')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('heading', { name: unit.datasheet.name }));

    expect(screen.queryByText('Abilities')).not.toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-core-abilities')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-abilities')).toBeInTheDocument();
  });
});
