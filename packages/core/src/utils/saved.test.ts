import { describe, it, expect } from 'vitest';
import type { Collection, Datasheet, Roster } from '../types/depot.js';
import {
  isFullDatasheet,
  placeholderDatasheet,
  toStoredCollection,
  toStoredRoster
} from './saved.js';

const datasheet: Datasheet = {
  id: 'ds-1',
  slug: 'intercessor-squad',
  name: 'Intercessor Squad',
  factionId: 'SM',
  factionSlug: 'space-marines',
  sourceId: 'core',
  isSupport: false,
  loadout: '',
  transport: '',
  virtual: false,
  link: '',
  abilities: [{ id: 'a1', name: 'Oath', factionId: 'SM', type: 'Faction' }],
  keywords: [],
  models: [],
  options: [],
  wargear: [
    { id: 'w1', datasheetId: 'ds-1', line: '1', name: 'Bolt Rifle', type: 'Ranged', profiles: [] }
  ],
  unitComposition: [],
  modelCosts: [{ datasheetId: 'ds-1', line: '1', description: '5 models', cost: '100' }],
  stratagemIds: ['s1'],
  leaders: [],
  isForgeWorld: false,
  isLegends: false
};

const unit = {
  id: 'u1',
  datasheet,
  modelCost: datasheet.modelCosts[0],
  selectedWargear: datasheet.wargear,
  selectedWargearAbilities: []
};

const roster: Roster = {
  id: 'r1',
  name: 'List',
  factionId: 'SM',
  detachments: [
    {
      id: 'det-1',
      slug: 'gladius',
      name: 'Gladius',
      type: '',
      dp: '',
      forceDisposition: '',
      chapterDp: [],
      abilities: [],
      enhancements: [],
      stratagems: []
    }
  ],
  points: { current: 100, max: 2000 },
  units: [unit],
  enhancements: [
    {
      enhancement: {
        id: 'enh-1',
        factionId: 'SM',
        name: 'Relic',
        cost: '15',
        detachment: 'Gladius'
      },
      unitId: 'u1'
    }
  ]
};

describe('toStoredRoster', () => {
  const stored = toStoredRoster(roster);

  it('keeps identity, selections and points but drops the datasheet', () => {
    expect(stored.units[0].datasheet).toEqual({
      id: 'ds-1',
      slug: 'intercessor-squad',
      name: 'Intercessor Squad',
      factionSlug: 'space-marines'
    });
    expect(stored.units[0].selectedWargear).toEqual([{ id: 'w1', name: 'Bolt Rifle' }]);
    expect(stored.units[0].modelCost.cost).toBe('100');
    expect(stored.points).toEqual({ current: 100, max: 2000 });
  });

  it('stores detachments and enhancements as references', () => {
    expect(stored.detachments).toEqual([{ id: 'det-1', slug: 'gladius', name: 'Gladius' }]);
    expect(stored.enhancements[0].enhancement).toEqual({
      id: 'enh-1',
      name: 'Relic',
      cost: '15',
      detachment: 'Gladius'
    });
  });

  it('shrinks the saved document', () => {
    expect(JSON.stringify(stored).length).toBeLessThan(JSON.stringify(roster).length / 2);
  });
});

describe('toStoredCollection', () => {
  it('keeps the painted state alongside the slim unit', () => {
    const collection: Collection = {
      id: 'c1',
      name: 'Shelf',
      factionId: 'SM',
      items: [{ ...unit, state: 'battle-ready' }],
      points: { current: 100 }
    };

    const [item] = toStoredCollection(collection).items;
    expect(item.state).toBe('battle-ready');
    expect(item.datasheet).toEqual({
      id: 'ds-1',
      slug: 'intercessor-squad',
      name: 'Intercessor Squad',
      factionSlug: 'space-marines'
    });
  });
});

describe('placeholderDatasheet', () => {
  it('is renderable but empty, and reads as not full', () => {
    const placeholder = placeholderDatasheet({
      id: 'ds-9',
      slug: 'gone',
      name: 'Gone',
      factionSlug: 'space-marines'
    });

    expect(placeholder.name).toBe('Gone');
    expect(placeholder.wargear).toEqual([]);
    expect(isFullDatasheet(placeholder)).toBe(true);
    expect(isFullDatasheet({ id: 'x', slug: 'x', name: 'X', factionSlug: 'y' })).toBe(false);
  });
});
