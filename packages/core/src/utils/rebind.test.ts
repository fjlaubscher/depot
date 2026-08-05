import { describe, it, expect } from 'vitest';
import type { Ability, CollectionUnit, Datasheet, ModelCost, Wargear } from '../types/depot.js';
import {
  applyCollectionRebind,
  matchDatasheetIdentity,
  rebindCollectionUnit,
  rebindModelCost,
  rebindSelectedWargear,
  rebindUnitSelections
} from './rebind.js';

const wargear = (overrides: Partial<Wargear> & Pick<Wargear, 'id' | 'name'>): Wargear => ({
  datasheetId: 'ds-1',
  line: '1',
  type: 'Ranged',
  profiles: [],
  ...overrides
});

const cost = (overrides: Partial<ModelCost> = {}): ModelCost => ({
  datasheetId: 'ds-1',
  line: '1',
  description: '5 models',
  cost: '100',
  ...overrides
});

const datasheet = (overrides: Partial<Datasheet> = {}): Datasheet => ({
  id: 'ds-1',
  slug: 'intercessor-squad',
  name: 'Intercessor Squad',
  factionId: 'SM',
  factionSlug: 'space-marines',
  sourceId: 'core',
  legend: '',
  role: 'Battleline',
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
  wargear: [
    wargear({ id: 'ds-1:bolt-rifle', name: 'Bolt Rifle' }),
    wargear({ id: 'ds-1:plasma-pistol', name: 'Plasma Pistol' })
  ],
  unitComposition: [],
  modelCosts: [cost(), cost({ line: '2', description: '10 models', cost: '200' })],
  stratagems: [],
  enhancements: [],
  detachmentAbilities: [],
  leaders: [],
  isForgeWorld: false,
  isLegends: false,
  ...overrides
});

const collectionUnit = (overrides: Partial<CollectionUnit> = {}): CollectionUnit => ({
  id: 'item-1',
  datasheet: datasheet(),
  modelCost: cost(),
  selectedWargear: [wargear({ id: 'ds-1:bolt-rifle', name: 'Bolt Rifle' })],
  selectedWargearAbilities: [],
  state: 'sprue',
  datasheetSlug: 'intercessor-squad',
  ...overrides
});

describe('matchDatasheetIdentity', () => {
  const catalog = [
    datasheet({ id: 'a', slug: 'alpha', name: 'Alpha' }),
    datasheet({ id: 'b', slug: 'beta', name: 'Beta Squad' })
  ];

  it('matches by id first', () => {
    expect(matchDatasheetIdentity({ id: 'b', slug: 'alpha', name: 'Alpha' }, catalog)?.id).toBe(
      'b'
    );
  });

  it('falls back to slug', () => {
    expect(matchDatasheetIdentity({ slug: 'beta' }, catalog)?.name).toBe('Beta Squad');
  });

  it('falls back to case-insensitive name', () => {
    expect(matchDatasheetIdentity({ name: 'beta squad' }, catalog)?.slug).toBe('beta');
  });

  it('returns null when nothing matches', () => {
    expect(matchDatasheetIdentity({ id: 'x', slug: 'y', name: 'Z' }, catalog)).toBeNull();
  });
});

describe('rebindModelCost', () => {
  const available = [cost(), cost({ line: '2', description: '10 models', cost: '200' })];

  it('matches by line', () => {
    const result = rebindModelCost(cost({ line: '2', description: 'old', cost: '999' }), available);
    expect(result.matched).toBe(true);
    expect(result.modelCost.cost).toBe('200');
  });

  it('matches by description when line changed', () => {
    const result = rebindModelCost(
      cost({ line: '99', description: '10 models', cost: '999' }),
      available
    );
    expect(result.matched).toBe(true);
    expect(result.modelCost.line).toBe('2');
  });

  it('falls back to first cost when unmatched', () => {
    const result = rebindModelCost(
      cost({ line: '9', description: 'unknown', cost: '1' }),
      available
    );
    expect(result.matched).toBe(false);
    expect(result.modelCost.line).toBe('1');
  });
});

describe('rebindSelectedWargear', () => {
  const available = [
    wargear({ id: 'new:bolt-rifle', name: 'Bolt Rifle' }),
    wargear({ id: 'new:plasma-pistol', name: 'Plasma Pistol' })
  ];

  it('matches by id when present', () => {
    const { wargear: matched, dropped } = rebindSelectedWargear(
      [wargear({ id: 'new:bolt-rifle', name: 'Bolt Rifle' })],
      available
    );
    expect(matched).toHaveLength(1);
    expect(dropped).toHaveLength(0);
  });

  it('falls back to name when id changed (edition churn)', () => {
    const { wargear: matched, dropped } = rebindSelectedWargear(
      [wargear({ id: 'old:bolt-rifle', name: 'Bolt Rifle' })],
      available
    );
    expect(matched[0]?.id).toBe('new:bolt-rifle');
    expect(dropped).toHaveLength(0);
  });

  it('drops weapons that no longer exist', () => {
    const { wargear: matched, dropped } = rebindSelectedWargear(
      [wargear({ id: 'gone', name: 'Grav-gun' })],
      available
    );
    expect(matched).toHaveLength(0);
    expect(dropped).toEqual(['Grav-gun']);
  });
});

describe('rebindUnitSelections', () => {
  it('reports partial when wargear is dropped', () => {
    const result = rebindUnitSelections(
      {
        modelCost: cost(),
        selectedWargear: [wargear({ id: 'x', name: 'Missing Gun' })],
        selectedWargearAbilities: []
      },
      datasheet()
    );
    expect(result.status).toBe('partial');
    expect(result.issues.some((issue) => issue.kind === 'wargear-dropped')).toBe(true);
  });

  it('rebinds wargear abilities by name when ids change', () => {
    const ability = (overrides: Partial<Ability> & Pick<Ability, 'id' | 'name'>): Ability => ({
      legend: '',
      factionId: 'SM',
      description: '',
      type: 'Wargear',
      ...overrides
    });

    const result = rebindUnitSelections(
      {
        modelCost: cost(),
        selectedWargear: [],
        selectedWargearAbilities: [ability({ id: 'old', name: 'Special Issue' })]
      },
      datasheet({
        abilities: [ability({ id: 'new', name: 'Special Issue' })]
      })
    );

    expect(result.selectedWargearAbilities).toHaveLength(1);
    expect(result.selectedWargearAbilities[0]?.id).toBe('new');
    expect(result.status).toBe('ok');
  });
});

describe('rebindCollectionUnit', () => {
  it('keeps embedded snapshot when datasheet is missing', () => {
    const item = collectionUnit();
    const result = rebindCollectionUnit(item, null);
    expect(result.status).toBe('missing');
    expect(result.item).toBe(item);
    expect(result.issues[0]?.kind).toBe('datasheet-missing');
  });

  it('updates datasheet and slug on successful rebind', () => {
    const next = datasheet({
      id: 'ds-2',
      slug: 'intercessor-squad-v2',
      name: 'Intercessor Squad',
      wargear: [wargear({ id: 'ds-2:bolt-rifle', name: 'Bolt Rifle' })],
      modelCosts: [cost({ datasheetId: 'ds-2' })]
    });
    const result = rebindCollectionUnit(collectionUnit(), next);
    expect(result.status).toBe('ok');
    expect(result.item.datasheet.id).toBe('ds-2');
    expect(result.item.datasheetSlug).toBe('intercessor-squad-v2');
    expect(result.item.selectedWargear[0]?.id).toBe('ds-2:bolt-rifle');
    expect(result.item.state).toBe('sprue');
  });
});

describe('applyCollectionRebind', () => {
  it('recalculates points and summarizes statuses', () => {
    const itemOk = rebindCollectionUnit(collectionUnit({ id: 'a' }), datasheet());
    const itemMissing = rebindCollectionUnit(collectionUnit({ id: 'b' }), null);
    const result = applyCollectionRebind(
      {
        id: 'c1',
        name: 'Pile',
        factionId: 'SM',
        items: [],
        points: { current: 0 },
        dataVersion: 'old'
      },
      [itemOk, itemMissing],
      'new-version'
    );

    expect(result.collection.dataVersion).toBe('new-version');
    expect(result.summary).toEqual({ ok: 1, partial: 0, missing: 1 });
    expect(result.collection.items).toHaveLength(2);
    expect(result.collection.points.current).toBeGreaterThan(0);
  });
});
