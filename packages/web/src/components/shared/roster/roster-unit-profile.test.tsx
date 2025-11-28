import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import RosterUnitProfile from './roster-unit-profile';
import { createMockDatasheet, createMockRosterUnit } from '@/test/mock-data';

describe('RosterUnitProfile', () => {
  it('renders model stats, abilities and selected wargear', () => {
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
          id: 'wg-1',
          name: 'Blade Storm',
          legend: '',
          factionId: 'SM',
          description: '<p>Blade storm description</p>',
          type: 'Wargear'
        }
      ]
    });

    const unit = createMockRosterUnit({
      datasheet,
      selectedWargear: datasheet.wargear,
      selectedWargearAbilities: [datasheet.abilities[1]]
    });

    render(<RosterUnitProfile unit={unit} abilitiesTestId="roster-unit-abilities" />);

    expect(screen.getByTestId('roster-unit-profile')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-abilities')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-selected-wargear')).toBeInTheDocument();
  });
});
