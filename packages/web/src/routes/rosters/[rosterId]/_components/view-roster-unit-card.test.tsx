import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestWrapper } from '@/test/test-utils';
import { createMockRosterUnit, createMockDatasheet, mockDatasheet } from '@/test/mock-data';
import ViewRosterUnitCard from './view-roster-unit-card';

describe('ViewRosterUnitCard', () => {
  it('expands to show datasheet abilities and keywords', () => {
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

    expect(screen.getByText(/relic blade/i)).toBeInTheDocument();
    expect(screen.queryByText('Abilities')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('heading', { name: unit.datasheet.name }));

    expect(screen.getByTestId('roster-unit-abilities')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-abilities-tag-leader')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-abilities-tag-shock-assault')).toBeInTheDocument();
    expect(screen.getByText(/infantry/i)).toBeInTheDocument();
    expect(screen.getByText(/character/i)).toBeInTheDocument();
  });

  it('keeps the card expanded when interacting within details', () => {
    const datasheetWithInlineAbility = createMockDatasheet({
      abilities: [
        ...mockDatasheet.abilities,
        {
          id: 'battle-focus',
          name: 'Battle Focus',
          legend: '',
          factionId: 'SM',
          description: 'Unit ability description',
          type: 'Datasheet'
        }
      ]
    });

    const unit = createMockRosterUnit({
      datasheet: datasheetWithInlineAbility,
      modelCost: datasheetWithInlineAbility.modelCosts[0]
    });

    render(<ViewRosterUnitCard unit={unit} />, { wrapper: TestWrapper });

    fireEvent.click(screen.getByRole('heading', { name: unit.datasheet.name }));
    expect(screen.getByTestId('roster-unit-abilities')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('roster-unit-abilities-tag-battle-focus'));

    expect(screen.getByTestId('roster-unit-abilities')).toBeInTheDocument();
  });

  it('omits leader and wargear sections in roster detail view', () => {
    const datasheet = createMockDatasheet({
      wargear: mockDatasheet.wargear,
      leaders: mockDatasheet.leaders
    });

    const unit = createMockRosterUnit({
      datasheet,
      modelCost: datasheet.modelCosts[0]
    });

    render(<ViewRosterUnitCard unit={unit} />, { wrapper: TestWrapper });

    fireEvent.click(screen.getByRole('heading', { name: unit.datasheet.name }));

    expect(screen.queryByText(/wargear & options/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/attachment options/i)).not.toBeInTheDocument();
  });
});
