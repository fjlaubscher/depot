import { describe, it, expect } from 'vitest';

import { generateRosterShareText } from './roster';
import { createMockRoster, createMockRosterUnit, mockDatasheet } from '@/test/mock-data';

describe('generateRosterShareText', () => {
  const wargearSelection = mockDatasheet.wargear.slice(0, 1);
  const roster = createMockRoster({
    units: [
      createMockRosterUnit({
        selectedWargear: wargearSelection
      })
    ]
  });

  it('excludes wargear by default', () => {
    const shareText = generateRosterShareText(roster, 'Test Faction');

    expect(shareText).toContain('- Captain - Captain (80 pts)');
    expect(shareText).not.toContain('Bolt pistol');
  });

  it('includes wargear when option enabled', () => {
    const shareText = generateRosterShareText(roster, 'Test Faction', {
      includeWargear: true
    });

    expect(shareText).toContain(wargearSelection[0].name);
  });
});
