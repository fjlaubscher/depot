import { describe, it, expect } from 'vitest';

import { generateRosterShareText } from './roster';
import {
  createMockRoster,
  createMockRosterUnit,
  mockDatasheet,
  mockEnhancement
} from '@/test/mock-data';
import { formatWargearDisplayName } from '@/utils/wargear';

describe('generateRosterShareText', () => {
  const wargearSelection = mockDatasheet.wargear.slice(0, 1);
  const unit = createMockRosterUnit({
    selectedWargear: wargearSelection
  });
  const roster = createMockRoster({
    units: [unit],
    enhancements: [{ enhancement: mockEnhancement, unitId: unit.id }]
  });

  it('excludes wargear and wargear abilities by default', () => {
    const shareText = generateRosterShareText(roster, 'Test Faction');

    expect(shareText).toContain('- Captain - Captain (80 pts)');
    expect(shareText).not.toContain('Bolt pistol');
    expect(shareText).not.toContain('[Wargear Ability]');
    expect(shareText).toContain(`${window.location.origin}/`);
    expect(shareText).toContain(`  - [Enhancement] ${mockEnhancement.name} (10 pts)`);
    expect(shareText).not.toContain('*Enhancements*');
  });

  it('includes wargear when option enabled', () => {
    const shareText = generateRosterShareText(roster, 'Test Faction', {
      includeWargear: true
    });

    expect(shareText).toContain(formatWargearDisplayName(wargearSelection[0]));
    expect(shareText).toContain(`  - [Enhancement] ${mockEnhancement.name} (10 pts)`);
  });

  it('includes wargear abilities when enabled', () => {
    const abilityRoster = createMockRoster({
      units: [
        createMockRosterUnit({
          selectedWargearAbilities: [
            {
              id: 'wa-1',
              name: 'Test Ability',
              description: 'Adds extra attacks',
              legend: '',
              type: 'Wargear',
              factionId: 'test'
            }
          ]
        })
      ]
    });

    const shareText = generateRosterShareText(abilityRoster, 'Test Faction', {
      includeWargearAbilities: true
    });

    expect(shareText).toContain('[Wargear Ability] Test Ability');
  });

  it('includes wargear abilities when wargear sharing is enabled', () => {
    const abilityRoster = createMockRoster({
      units: [
        createMockRosterUnit({
          selectedWargearAbilities: [
            {
              id: 'wa-1',
              name: 'Test Ability',
              description: 'Adds extra attacks',
              legend: '',
              type: 'Wargear',
              factionId: 'test'
            }
          ]
        })
      ]
    });

    const shareText = generateRosterShareText(abilityRoster, 'Test Faction', {
      includeWargear: true
    });

    expect(shareText).toContain('[Wargear Ability] Test Ability');
  });

  it('marks the warlord in the exported text', () => {
    const shareText = generateRosterShareText(
      createMockRoster({
        units: roster.units,
        enhancements: roster.enhancements,
        warlordUnitId: roster.units[0].id
      }),
      'Test Faction'
    );

    expect(shareText).toContain('- [Warlord] Captain - Captain (80 pts)');
    expect(shareText).toContain(`  - [Enhancement] ${mockEnhancement.name} (10 pts)`);
  });
});
