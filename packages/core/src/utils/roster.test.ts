import { describe, expect, it } from 'vitest';
import type { Ability, ModelCost, Roster, RosterUnit, Wargear } from '../types/depot.js';
import {
  calculateTotalPoints,
  createRosterDuplicate,
  generateRosterMarkdown,
  groupRosterUnitsByRole
} from './roster.js';

const createModelCost = (overrides: Partial<ModelCost> = {}): ModelCost => ({
  datasheetId: overrides.datasheetId ?? 'ds-1',
  line: overrides.line ?? '1',
  description: overrides.description ?? '10 models',
  cost: overrides.cost ?? '100'
});

const createAbility = (overrides: Partial<Ability> = {}): Ability => ({
  id: overrides.id ?? 'ab-1',
  name: overrides.name ?? 'Stealth Field',
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
      name: 'Captain',
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
      role: 'Leader',
      roleLabel: 'Leader',
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
  modelCost: overrides.modelCost ?? createModelCost(),
  selectedWargear: overrides.selectedWargear ?? [createWargear()],
  selectedWargearAbilities: overrides.selectedWargearAbilities ?? [createAbility()],
  enhancements: overrides.enhancements ?? [],
  detachmentRules: overrides.detachmentRules ?? [],
  datasheetRole: overrides.datasheetRole ?? 'Leader'
});

const createRoster = (overrides: Partial<Roster> = {}): Roster => ({
  id: overrides.id ?? 'roster-1',
  name: overrides.name ?? 'Strike Force',
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
        cost: '25',
        detachment: 'gladius'
      }
    }
  ],
  points: overrides.points ?? { current: 0, max: 2000 },
  warlordUnitId: overrides.warlordUnitId ?? overrides.units?.[0]?.id ?? 'unit-1',
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  dataVersion: overrides.dataVersion ?? null,
  notes: overrides.notes ?? '',
  factionKeyword: overrides.factionKeyword ?? 'ADEPTUS ASTARTES',
  cogitatorAnalysis: overrides.cogitatorAnalysis ?? null,
  shareCode: overrides.shareCode ?? null
});

describe('roster utils', () => {
  it('calculates total roster points from units and enhancements', () => {
    const roster = createRoster({
      units: [createRosterUnit({ modelCost: createModelCost({ cost: '110' }) })],
      enhancements: [
        {
          unitId: 'unit-1',
          enhancement: {
            id: 'enh-1',
            factionId: 'test',
            name: 'Artificer Armour',
            legend: '',
            description: '',
            cost: '25',
            detachment: 'gladius'
          }
        }
      ]
    });

    expect(calculateTotalPoints(roster)).toBe(135);
  });

  it('groups roster units by role and sorts names', () => {
    const units = [
      createRosterUnit({
        id: 'unit-1',
        datasheet: { ...createRosterUnit().datasheet, role: 'Battleline', name: 'B' }
      }),
      createRosterUnit({
        id: 'unit-2',
        datasheet: { ...createRosterUnit().datasheet, role: 'Battleline', name: 'A' }
      }),
      createRosterUnit({
        id: 'unit-3',
        datasheet: { ...createRosterUnit().datasheet, role: 'Leader', name: 'Captain' }
      })
    ];

    const grouped = groupRosterUnitsByRole(units);

    expect(Object.keys(grouped)).toEqual(['Battleline', 'Leader']);
    expect(grouped.Battleline[0].datasheet.name).toBe('A');
    expect(grouped.Battleline[1].datasheet.name).toBe('B');
  });

  it('generates markdown including wargear and abilities', () => {
    const roster = createRoster({
      name: 'Strike Force Echo',
      units: [
        createRosterUnit({
          id: 'unit-1',
          datasheet: { ...createRosterUnit().datasheet, role: 'Leader', name: 'Captain' },
          selectedWargear: [createWargear({ name: 'Combi-weapon' })],
          selectedWargearAbilities: [createAbility({ name: 'Combi-aim' })]
        })
      ],
      enhancements: []
    });

    const markdown = generateRosterMarkdown(roster, 'Space Marines');

    expect(markdown).toContain('# Strike Force Echo');
    expect(markdown).toContain('**Faction:** Space Marines');
    expect(markdown).toContain('## Leader');
    expect(markdown).toContain('- **[Warlord] Captain**');
    expect(markdown).toContain('Combi-weapon');
    expect(markdown).toContain('[Wargear Ability] Combi-aim');
  });

  it('duplicates rosters with new ids while preserving selections', () => {
    const roster = createRoster({
      units: [createRosterUnit({ id: 'unit-abc' })],
      warlordUnitId: 'unit-abc'
    });

    const duplicated = createRosterDuplicate(roster, { name: 'Copy' });

    expect(duplicated.id).not.toBe(roster.id);
    expect(duplicated.units).toHaveLength(1);
    expect(duplicated.units[0].id).not.toBe('unit-abc');
    expect(duplicated.warlordUnitId).toBe(duplicated.units[0].id);
    expect(duplicated.name).toBe('Copy');
  });
});
