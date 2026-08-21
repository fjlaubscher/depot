import { describe, expect, it } from 'vitest';
import type { DatasheetWargear } from '../types/wahapedia.js';
import { formatWargearDisplayName, groupWargearProfiles } from './wargear.js';

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

describe('profile separators', () => {
  it('groups en-dashed profiles, which is what the source data actually uses', () => {
    const grouped = groupWargearProfiles([
      createEntry({ line: '9', lineInWargear: '1', name: 'Plasma pistol – standard' }),
      createEntry({
        line: '10',
        lineInWargear: '2',
        name: 'Plasma pistol – supercharge',
        description: 'Hazardous, Pistol'
      })
    ]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].name).toBe('Plasma pistol');
    expect(grouped[0].profiles.map((profile) => profile.profileName)).toEqual([
      'standard',
      'supercharge'
    ]);
  });

  it('leaves hyphenated words that are not profile suffixes alone', () => {
    const grouped = groupWargearProfiles([
      createEntry({ name: 'Twin-linked heavy bolter' }),
      createEntry({ line: '2', name: 'Vox-caster' })
    ]);

    expect(grouped.map((weapon) => weapon.name)).toEqual([
      'Twin-linked heavy bolter',
      'Vox-caster'
    ]);
  });

  it('formats a grouped weapon as one name with its profiles', () => {
    const [weapon] = groupWargearProfiles([
      createEntry({ lineInWargear: '1', name: 'Plasma pistol – standard' }),
      createEntry({ line: '2', lineInWargear: '2', name: 'Plasma pistol – supercharge' })
    ]);

    expect(formatWargearDisplayName(weapon)).toBe('Plasma pistol (standard / supercharge)');
  });
});
