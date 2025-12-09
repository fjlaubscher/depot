import { describe, expect, it } from 'vitest';
import type { Ability, Roster, RosterUnit, Wargear } from '../types/depot.js';
import { rosterShare } from '../index.js';

const createAbility = (overrides: Partial<Ability> = {}): Ability => ({
  id: overrides.id ?? 'wa-1',
  name: overrides.name ?? 'Test Ability',
  legend: overrides.legend ?? '',
  factionId: overrides.factionId ?? 'test',
  description: overrides.description ?? '',
  type: overrides.type ?? 'Wargear',
  parameter: overrides.parameter
});

const createWargear = (overrides: Partial<Wargear> = {}): Wargear => ({
  id: overrides.id ?? 'wg-1',
  datasheetId: overrides.datasheetId ?? 'ds-1',
  line: overrides.line ?? '1',
  name: overrides.name ?? 'Bolt pistol',
  type: overrides.type ?? 'Ranged',
  profiles: overrides.profiles ?? [
    {
      datasheetId: 'ds-1',
      line: '1',
      lineInWargear: '1',
      dice: '1',
      name: 'Bolt pistol',
      profileName: undefined,
      description: '',
      range: '12',
      type: 'Ranged',
      a: '1',
      bsWs: '3',
      s: '4',
      ap: '-1',
      d: '1'
    }
  ]
});

const createRosterUnit = (overrides: Partial<RosterUnit> = {}): RosterUnit => ({
  id: overrides.id ?? 'unit-1',
  name: overrides.name ?? 'Captain',
  datasheetSlug: overrides.datasheetSlug ?? 'captain',
  datasheet:
    overrides.datasheet ??
    ({
      id: 'ds-1',
      slug: 'captain',
      name: overrides.datasheet?.name ?? 'Captain',
      factionId: 'test',
      factionSlug: 'test',
      sourceId: 'wahapedia',
      sourceName: 'Wahapedia',
      supplementKey: undefined,
      supplementSlug: undefined,
      supplementName: undefined,
      supplementLabel: undefined,
      isSupplement: false,
      legend: '',
      role: overrides.datasheet?.role ?? 'Leader',
      roleLabel: overrides.datasheet?.roleLabel ?? 'Leader',
      loadout: '',
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
      wargear: overrides.datasheet?.wargear ?? [createWargear()],
      unitComposition: [],
      modelCosts: [],
      stratagems: [],
      enhancements: [],
      detachmentAbilities: [],
      leaders: [],
      isForgeWorld: false,
      isLegends: false
    } as RosterUnit['datasheet']),
  modelCost: overrides.modelCost ?? {
    datasheetId: 'ds-1',
    line: '1',
    description: 'Captain',
    cost: '80'
  },
  selectedWargear: overrides.selectedWargear ?? [createWargear()],
  selectedWargearAbilities: overrides.selectedWargearAbilities ?? [],
  enhancements: overrides.enhancements ?? [],
  detachmentRules: overrides.detachmentRules ?? [],
  datasheetRole: overrides.datasheetRole ?? 'Leader'
});

const createRoster = (overrides: Partial<Roster> = {}): Roster => ({
  id: overrides.id ?? 'roster-1',
  name: overrides.name ?? 'Test Force',
  factionId: overrides.factionId ?? 'test',
  factionSlug: overrides.factionSlug ?? 'test',
  faction: overrides.faction ?? null,
  detachment: overrides.detachment ?? { id: 'det-1', name: 'Gladius Task Force', slug: 'gladius' },
  detachmentId: overrides.detachmentId,
  detachmentSlug: overrides.detachmentSlug,
  units: overrides.units ?? [createRosterUnit()],
  enhancements: overrides.enhancements ?? [
    {
      unitId: overrides.units?.[0]?.id ?? 'unit-1',
      enhancement: {
        id: 'enh-1',
        factionId: 'test',
        name: 'Artificer Armour',
        legend: '',
        description: '',
        cost: '10',
        detachment: 'gladius'
      }
    }
  ],
  points: overrides.points ?? { current: 90, max: 2000 },
  warlordUnitId: overrides.warlordUnitId ?? overrides.units?.[0]?.id ?? 'unit-1',
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  dataVersion: overrides.dataVersion ?? null,
  notes: overrides.notes ?? '',
  factionKeyword: overrides.factionKeyword ?? 'ADEPTUS ASTARTES',
  cogitatorAnalysis: overrides.cogitatorAnalysis ?? null,
  shareCode: overrides.shareCode ?? null
});

describe('rosterShare helpers', () => {
  it('generates share text containing wargear when requested', () => {
    const roster = createRoster({
      units: [
        createRosterUnit({
          selectedWargear: [createWargear({ name: 'Power sword' })],
          selectedWargearAbilities: [createAbility({ name: 'Duellist Strike' })]
        })
      ]
    });

    const text = rosterShare.generateRosterShareText(roster, 'Space Marines', {
      includeWargear: true,
      includeWargearAbilities: true
    });

    expect(text).toContain('- [Warlord] Captain - Captain (80 pts)');
    expect(text).toContain('Power sword');
    expect(text).toContain('[Wargear Ability] Duellist Strike');
  });

  it('marks the warlord and enhancements in the share text', () => {
    const unit = createRosterUnit({ id: 'unit-1' });
    const roster = createRoster({
      units: [unit],
      warlordUnitId: 'unit-1',
      enhancements: [
        {
          unitId: 'unit-1',
          enhancement: {
            id: 'enh-1',
            factionId: 'test',
            name: 'The Honour Veil',
            legend: '',
            description: '',
            cost: '15',
            detachment: 'gladius'
          }
        }
      ]
    });

    const text = rosterShare.generateRosterShareText(roster, 'Space Marines');

    expect(text).toContain('- [Warlord] Captain - Captain (80 pts)');
    expect(text).toContain('[Enhancement] The Honour Veil (15 pts)');
  });
});
