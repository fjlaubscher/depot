import { describe, expect, it } from 'vitest';
import type { DatasheetWargear } from '../types/wahapedia.js';
import { groupWargearProfiles } from './wargear.js';

const createEntry = (overrides: Partial<DatasheetWargear> = {}): DatasheetWargear => ({
  datasheetId: 'ds-1',
  line: '1',
  lineInWargear: '1',
  name: 'Bolt pistol',
  range: '12',
  dice: '1',
  type: 'Ranged',
  a: '1',
  bsWs: '3',
  s: '4',
  ap: '-1',
  d: '1',
  description: 'Pistol, Lethal Hits',
  ...overrides
});

describe('groupWargearProfiles', () => {
  it('groups multi-profile weapons and derives slug-based ids', () => {
    const grouped = groupWargearProfiles([
      createEntry(),
      createEntry({
        line: '2',
        lineInWargear: '2',
        name: 'Bolt pistol - Melee Strike',
        range: 'Melee',
        type: 'Melee'
      }),
      createEntry({ line: '3', name: 'Chainsword', range: 'Melee', type: 'Melee' })
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].id).toBe('ds-1:bolt-pistol');
    expect(grouped[0].profiles).toHaveLength(2);
    expect(grouped[0].profiles[1].profileName).toBe('Melee Strike');
    expect(grouped[0].type).toBe('Mixed');
    expect(grouped[1].id).toBe('ds-1:chainsword');
  });
});
