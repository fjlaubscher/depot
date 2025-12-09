import { describe, expect, it } from 'vitest';
import type { Datasheet, Wargear } from '../types/depot.js';
import type { DatasheetWargear } from '../types/wahapedia.js';
import { normalizeDatasheetWargear, normalizeSelectedWargear } from './wargear.js';

const createDatasheet = (overrides: Partial<Datasheet> = {}): Datasheet => ({
  id: 'ds-1',
  slug: 'test-unit',
  name: 'Test Unit',
  factionId: 'test',
  factionSlug: 'test',
  sourceId: 'wahapedia',
  sourceName: 'Wahapedia',
  supplementKey: 'codex',
  legend: '',
  role: 'Battleline',
  roleLabel: 'Battleline',
  loadout: 'Every model is equipped with: Bolt pistol; Chainsword.',
  transport: '',
  virtual: false,
  leaderHead: '',
  leaderFooter: '',
  damagedW: '',
  damagedDescription: '',
  link: '',
  abilities: [],
  keywords: [],
  models: [],
  options: [],
  wargear: [],
  unitComposition: [],
  modelCosts: [],
  stratagems: [],
  enhancements: [],
  detachmentAbilities: [],
  leaders: [],
  isForgeWorld: false,
  isLegends: false,
  ...overrides
});

const createLegacyWargearEntries = (): DatasheetWargear[] => [
  {
    datasheetId: 'ds-legacy',
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
    description: 'Pistol, Lethal Hits'
  },
  {
    datasheetId: 'ds-legacy',
    line: '2',
    lineInWargear: '2',
    name: 'Bolt pistol - Melee Strike',
    range: 'Melee',
    dice: '1',
    type: 'Melee',
    a: '2',
    bsWs: '3',
    s: '4',
    ap: '0',
    d: '1',
    description: 'melee attack'
  }
];

describe('wargear normalization helpers', () => {
  it('converts legacy wargear arrays into grouped weapons', () => {
    const legacyEntries = createLegacyWargearEntries();
    const datasheet = createDatasheet({
      id: 'ds-legacy',
      slug: 'legacy-unit',
      wargear: legacyEntries as unknown as Wargear[]
    });

    const normalized = normalizeDatasheetWargear(datasheet);

    expect(normalized.wargear).toHaveLength(1);
    expect(normalized.wargear[0].profiles).toHaveLength(2);
    expect(normalized.wargear[0].id).toContain('ds-legacy');
  });

  it('matches legacy wargear selections to normalized wargear entries', () => {
    const legacyEntries = createLegacyWargearEntries();
    const datasheet = createDatasheet({
      id: 'ds-legacy',
      slug: 'legacy-unit',
      wargear: legacyEntries as unknown as Wargear[]
    });
    const normalized = normalizeDatasheetWargear(datasheet);

    const result = normalizeSelectedWargear(
      legacyEntries as unknown as Wargear[],
      normalized.wargear
    );

    expect(result).toHaveLength(1);
    expect(result[0].profiles).toHaveLength(2);
    expect(result[0].profiles[0].name).toBe('Bolt pistol');
  });
});
