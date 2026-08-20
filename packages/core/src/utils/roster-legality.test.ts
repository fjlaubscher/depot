import { describe, expect, it } from 'vitest';
import type { Datasheet, Detachment, Enhancement, Roster, RosterUnit } from '../types/depot.js';
import {
  enforceCostBrackets,
  getBattleSize,
  getEligibleEnhancements,
  getRosterDpSpent,
  getUnitOrdinal,
  validateRoster
} from './roster-legality.js';

const datasheet = (overrides: Partial<Datasheet> & { id: string }): Datasheet =>
  ({
    slug: overrides.id,
    name: overrides.id,
    factionId: 'SM',
    factionSlug: 'space-marines',
    sourceId: '',
    legend: '',
    isSupport: false,
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
  }) as Datasheet;

const kw = (...keywords: string[]) =>
  keywords.map((keyword) => ({ datasheetId: '', keyword, model: '', isFactionKeyword: 'false' }));

const detachment = (overrides: Partial<Detachment> & { id: string }): Detachment => ({
  slug: overrides.id,
  name: overrides.id,
  legend: '',
  type: '',
  dp: '2',
  forceDisposition: '',
  chapterDp: [],
  abilities: [],
  enhancements: [],
  stratagems: [],
  ...overrides
});

const enhancement = (overrides: Partial<Enhancement> & { id: string }): Enhancement => ({
  factionId: 'SM',
  name: overrides.id,
  legend: '',
  description: '',
  cost: '10',
  detachment: 'det',
  ...overrides
});

let counter = 0;
const unit = (sheet: Datasheet, section?: string): RosterUnit => ({
  id: `unit-${++counter}`,
  datasheet: sheet,
  modelCost: {
    datasheetId: sheet.id,
    line: '1',
    description: '1 model',
    cost: '100',
    ...(section ? { section } : {})
  },
  selectedWargear: []
});

const roster = (overrides: Partial<Roster> = {}): Roster => ({
  id: 'r',
  name: 'r',
  factionId: 'SM',
  detachments: [detachment({ id: 'det' })],
  points: { current: 0, max: 2000 },
  warlordUnitId: 'w',
  units: [],
  enhancements: [],
  ...overrides
});

const captain = datasheet({ id: 'captain', keywords: kw('Character', 'Infantry') });
const intercessors = datasheet({ id: 'intercessors', keywords: kw('Battleline', 'Infantry') });
const bracketed = datasheet({
  id: 'talos',
  modelCosts: [
    {
      datasheetId: 'talos',
      line: '2',
      description: '1 model',
      cost: '75',
      section: 'YOUR 1ST TO 2ND UNITS COST'
    },
    {
      datasheetId: 'talos',
      line: '5',
      description: '1 model',
      cost: '85',
      section: 'YOUR 3RD + UNIT COSTS'
    }
  ]
});

const talosUnit = (): RosterUnit => ({ ...unit(bracketed), modelCost: bracketed.modelCosts[0] });

describe('getBattleSize', () => {
  it('maps points totals onto the 25.03 table', () => {
    expect(getBattleSize(1000).name).toBe('Incursion');
    expect(getBattleSize(500).name).toBe('Incursion');
    expect(getBattleSize(2000).dp).toBe(3);
    expect(getBattleSize(3000).name).toBe('Strike Force');
  });
});

describe('getRosterDpSpent', () => {
  it('sums detachment DP and honours chapter overrides', () => {
    const det = detachment({
      id: 'a',
      dp: '2',
      chapterDp: [{ keyword: 'Black Templars', dp: '3' }]
    });
    expect(getRosterDpSpent(roster({ detachments: [det, detachment({ id: 'b', dp: '1' })] }))).toBe(
      3
    );
    const templar = unit(datasheet({ id: 'bt', keywords: kw('Black Templars') }));
    expect(getRosterDpSpent(roster({ detachments: [det], units: [templar] }))).toBe(3);
  });

  it('falls back to the legacy single detachment field', () => {
    expect(
      getRosterDpSpent({ detachments: [], detachment: detachment({ id: 'x', dp: '1' }), units: [] })
    ).toBe(1);
  });
});

describe('enforceCostBrackets', () => {
  it('moves the third copy of a datasheet onto the 3rd+ bracket and back', () => {
    const units = [talosUnit(), talosUnit(), talosUnit()];
    const enforced = enforceCostBrackets(units);
    expect(enforced.map((entry) => entry.modelCost.cost)).toEqual(['75', '75', '85']);
    expect(enforced[0]).toBe(units[0]);
    expect(enforceCostBrackets(enforced.slice(1)).map((entry) => entry.modelCost.cost)).toEqual([
      '75',
      '75'
    ]);
  });

  it('leaves units alone when no matching row exists', () => {
    const units = [bracketed, bracketed, bracketed].map((sheet) => ({
      ...unit(sheet),
      modelCost: {
        datasheetId: 'talos',
        line: '9',
        description: '2 models',
        cost: '150',
        section: 'YOUR 1ST TO 2ND UNITS COST'
      }
    }));
    expect(enforceCostBrackets(units)[2].modelCost.cost).toBe('150');
  });
});

describe('getUnitOrdinal', () => {
  it('counts copies of the same datasheet in roster order', () => {
    const units = [talosUnit(), unit(captain), talosUnit()];
    expect(getUnitOrdinal(units, units[0].id)).toBe(1);
    expect(getUnitOrdinal(units, units[1].id)).toBe(1);
    expect(getUnitOrdinal(units, units[2].id)).toBe(2);
    expect(getUnitOrdinal(units, 'nope')).toBe(0);
  });
});

describe('getEligibleEnhancements', () => {
  const upgrade = enhancement({ id: 'up', upgrade: true });
  const relic = enhancement({ id: 'relic' });
  const r = roster({ detachments: [detachment({ id: 'det', enhancements: [upgrade, relic] })] });

  it('lets characters take anything, others only upgrades, epic heroes nothing', () => {
    expect(getEligibleEnhancements(unit(captain), r)).toEqual([upgrade, relic]);
    expect(getEligibleEnhancements(unit(intercessors), r)).toEqual([upgrade]);
    expect(
      getEligibleEnhancements(
        unit(datasheet({ id: 'hero', keywords: kw('Character', 'Epic Hero') })),
        r
      )
    ).toEqual([]);
  });
});

describe('validateRoster', () => {
  it('accepts a legal list', () => {
    const leader = unit(captain);
    expect(
      validateRoster(roster({ units: [leader, unit(intercessors)], warlordUnitId: leader.id }))
    ).toEqual([]);
  });

  it('flags points, DP, duplicate detachments and missing warlord', () => {
    const det = detachment({ id: 'a', dp: '2' });
    const issues = validateRoster(
      roster({
        points: { current: 2100, max: 2000 },
        detachments: [det, det, detachment({ id: 'b', dp: '2' })],
        units: [unit(captain)],
        warlordUnitId: null
      })
    );
    expect(issues.map((issue) => issue.code)).toEqual(['points', 'dp', 'detachment', 'warlord']);
  });

  it('allows a lone 3 DP detachment at Incursion', () => {
    const issues = validateRoster(
      roster({
        points: { current: 0, max: 1000 },
        detachments: [detachment({ id: 'big', dp: '3' })]
      })
    );
    expect(issues).toEqual([]);
  });

  it('enforces per-datasheet unit limits, doubled for Battleline, 1 for Epic Heroes', () => {
    const hero = datasheet({ id: 'hero', name: 'Hero', keywords: kw('Character', 'Epic Hero') });
    const issues = validateRoster(
      roster({
        units: [
          ...Array.from({ length: 4 }, () => unit(captain)),
          ...Array.from({ length: 6 }, () => unit(intercessors)),
          unit(hero),
          unit(hero)
        ]
      })
    );
    expect(
      issues.filter((issue) => issue.code === 'unit-limit').map((issue) => issue.message)
    ).toEqual([
      'captain: 4 units selected; Strike Force allows 3.',
      'Hero: 2 units selected; Strike Force allows 1.'
    ]);
  });

  it('flags units sitting on the wrong cost bracket', () => {
    const units = [talosUnit(), talosUnit(), talosUnit()];
    const issues = validateRoster(roster({ units }));
    expect(issues.filter((issue) => issue.code === 'bracket')).toHaveLength(1);
    expect(
      validateRoster(roster({ units: enforceCostBrackets(units) })).filter(
        (i) => i.code === 'bracket'
      )
    ).toEqual([]);
  });

  it('applies the enhancement rules', () => {
    const relic = enhancement({ id: 'relic', name: 'Relic' });
    const upgrade = enhancement({ id: 'up', name: 'Upgrade', upgrade: true });
    const foreign = enhancement({ id: 'foreign', name: 'Foreign' });
    const det = detachment({ id: 'det', enhancements: [relic, upgrade] });
    const a = unit(captain);
    const b = unit(captain);
    const grunt = unit(intercessors);
    const hero = unit(
      datasheet({ id: 'hero', name: 'Hero', keywords: kw('Character', 'Epic Hero') })
    );
    const issues = validateRoster(
      roster({
        points: { current: 0, max: 1000 },
        detachments: [det],
        units: [a, b, grunt, hero],
        warlordUnitId: a.id,
        enhancements: [
          { enhancement: relic, unitId: a.id },
          { enhancement: relic, unitId: b.id },
          { enhancement: foreign, unitId: b.id },
          { enhancement: upgrade, unitId: grunt.id },
          { enhancement: upgrade, unitId: hero.id },
          { enhancement: upgrade, unitId: a.id },
          { enhancement: upgrade, unitId: b.id }
        ]
      })
    );
    const messages = issues.map((issue) => issue.message);
    expect(messages).toContain('Relic is taken 2 times; max 1.');
    expect(messages).toContain('Foreign is not from a selected detachment.');
    expect(messages).toContain('Upgrade is taken 4 times; max 3.');
    expect(messages).toContain('4 enhancements selected; Incursion allows 2.');
    expect(messages).toContain('captain has 2 enhancements; max 1 per unit.');
    expect(messages).toContain('Hero is an Epic Hero and cannot take Upgrade.');
    expect(messages).not.toContain('intercessors is not a Character and cannot take Upgrade.');
  });

  it('requires every support unit to find its own bodyguard', () => {
    const bodyguard = datasheet({ id: 'boyz', name: 'Boyz' });
    const support = datasheet({
      id: 'painboy',
      name: 'Painboy',
      isSupport: true,
      leaders: [{ id: 'boyz', slug: 'boyz' }]
    });
    const ok = validateRoster(roster({ units: [unit(bodyguard), unit(support)] }));
    expect(ok.filter((issue) => issue.code === 'support')).toEqual([]);
    const bad = validateRoster(roster({ units: [unit(bodyguard), unit(support), unit(support)] }));
    expect(bad.filter((issue) => issue.code === 'support')).toHaveLength(1);
    const lonely = validateRoster(roster({ units: [unit(support)] }));
    expect(lonely.filter((issue) => issue.code === 'support')[0].message).toBe(
      'Painboy is a Support unit with no free bodyguard unit to attach to.'
    );
  });
});
