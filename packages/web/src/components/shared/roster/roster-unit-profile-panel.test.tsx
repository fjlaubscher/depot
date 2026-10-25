import { act, render, screen, within } from '@testing-library/react';
import i18n from '@/i18n';
import { describe, it, expect } from 'vitest';

import RosterUnitProfilePanel from './roster-unit-profile-panel';
import { createMockDatasheet, createMockRosterUnit } from '@/test/mock-data';

describe('RosterUnitProfilePanel', () => {
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

    render(<RosterUnitProfilePanel unit={unit} abilitiesTestId="roster-unit-abilities" />);

    expect(screen.getByTestId('roster-unit-profile')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-abilities')).toBeInTheDocument();
    expect(screen.getByTestId('roster-unit-selected-wargear')).toBeInTheDocument();
  });

  it('shares French profile headings and abbreviations with collection and roster views', async () => {
    const datasheet = createMockDatasheet();
    const unit = createMockRosterUnit({ datasheet, selectedWargear: datasheet.wargear });
    render(<RosterUnitProfilePanel unit={unit} />);
    const profile = within(screen.getByTestId('roster-unit-profile'));
    expect(profile.getAllByText('T')).toHaveLength(datasheet.models.length);
    await act(() => i18n.changeLanguage('fr'));
    expect(profile.getAllByText('E')).toHaveLength(datasheet.models.length);
    expect(profile.getAllByText('PV')).toHaveLength(datasheet.models.length);
    expect(profile.getByRole('columnheader', { name: 'CT/CC' })).toBeInTheDocument();
    expect(profile.getByRole('columnheader', { name: 'Portée' })).toBeInTheDocument();
    expect(
      profile.getByRole('columnheader', { name: 'Équipement sélectionné' })
    ).toBeInTheDocument();
    expect(profile.getByText('Aptitudes')).toBeInTheDocument();
    expect(profile.getAllByText('Captain', { exact: false }).length).toBeGreaterThan(0);
  });
});
