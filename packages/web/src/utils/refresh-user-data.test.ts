import { describe, it, expect, vi } from 'vitest';
import type { depot } from '@depot/core';
import {
  formatRebindSummaryMessage,
  rebindRosterUnits,
  refreshRosterDataWithReport,
  refreshCollectionDataWithReport,
  hydrateRoster,
  hydrateCollection
} from './refresh-user-data';

const buildDatasheet = (overrides?: Partial<depot.Datasheet>): depot.Datasheet => ({
  id: 'ds-1',
  slug: 'unit-one',
  name: 'Unit One',
  factionId: 'faction-1',
  factionSlug: 'faction-1',
  sourceId: 'src',
  sourceName: 'Source',
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
  modelCosts: [{ datasheetId: 'ds-1', line: '1', description: '10', cost: '10' }],
  stratagemIds: [],
  leaders: [],
  isForgeWorld: false,
  isLegends: false,
  ...overrides
});

describe('refresh-user-data utilities', () => {
  const baseRoster: depot.Roster = {
    id: 'r1',
    name: 'Test Roster',
    factionId: 'faction-1',
    factionSlug: 'faction-1',
    faction: {
      id: 'faction-1',
      slug: 'faction-1',
      name: 'Faction',
      path: '/data/factions/faction-1/faction.json'
    },
    dataVersion: 'old-version',
    detachments: [
      {
        id: 'det-1',
        slug: 'det-1',
        name: 'Old Detachment',
        legend: '',
        type: '',
        dp: '',
        forceDisposition: '',
        chapterDp: [],
        abilities: [],
        enhancements: [],
        stratagems: []
      }
    ],
    points: { current: 10, max: 2000 },
    warlordUnitId: null,
    units: [
      {
        id: 'u1',
        datasheet: buildDatasheet(),
        modelCost: { datasheetId: 'ds-1', line: '1', description: '10', cost: '10' },
        selectedWargear: [],
        selectedWargearAbilities: [],
        datasheetSlug: 'unit-one'
      }
    ],
    enhancements: []
  };

  const baseCollection: depot.Collection = {
    id: 'c1',
    name: 'Test Collection',
    factionId: 'faction-1',
    factionSlug: 'faction-1',
    faction: {
      id: 'faction-1',
      slug: 'faction-1',
      name: 'Faction',
      path: '/data/factions/faction-1/faction.json'
    },
    dataVersion: 'old-version',
    items: [
      {
        id: 'ci1',
        datasheet: buildDatasheet(),
        modelCost: { datasheetId: 'ds-1', line: '1', description: '10', cost: '10' },
        selectedWargear: [],
        selectedWargearAbilities: [],
        state: 'sprue',
        datasheetSlug: 'unit-one'
      }
    ],
    points: { current: 10 }
  };

  it('refreshRosterDataWithReport updates datasheets, detachment, points, and dataVersion', async () => {
    const refreshedDatasheet = buildDatasheet({ name: 'Unit One Updated', slug: 'unit-one-new' });
    const refreshedDetachment: depot.Detachment = {
      id: 'det-1',
      slug: 'det-1',
      name: 'New Detachment',
      legend: '',
      type: '',
      dp: '2',
      forceDisposition: 'Take and Hold',
      chapterDp: [],
      abilities: [],
      enhancements: [],
      stratagems: []
    };

    const { roster: result } = await refreshRosterDataWithReport({
      roster: baseRoster,
      currentDataVersion: 'new-version',
      getDatasheet: vi.fn().mockResolvedValue(refreshedDatasheet),
      getFactionManifest: vi.fn().mockResolvedValue({
        id: 'faction-1',
        slug: 'faction-1',
        name: 'Faction',
        link: '',
        datasheets: [],
        detachments: [refreshedDetachment],
        datasheetCount: 0,
        detachmentCount: 1,
        dataVersion: 'new-version'
      })
    });

    expect(result.dataVersion).toBe('new-version');
    expect(result.detachments[0].name).toBe('New Detachment');
    expect(result.detachments[0].dp).toBe('2');
    expect(result.units[0].datasheet.name).toBe('Unit One Updated');
    expect(result.units[0].datasheetSlug).toBe('unit-one-new');
    expect(result.points.current).toBe(10);
  });

  it('rebindRosterUnits rebinds units in place and reports missing ones', async () => {
    const refreshedDatasheet = buildDatasheet({ name: 'Unit One Updated', slug: 'unit-one-new' });
    const getDatasheet = vi.fn().mockResolvedValueOnce(refreshedDatasheet).mockResolvedValue(null);

    const result = await rebindRosterUnits(
      [baseRoster.units[0], { ...baseRoster.units[0], id: 'unit-2' }],
      'faction-1',
      getDatasheet
    );

    expect(result.units[0].datasheet.name).toBe('Unit One Updated');
    expect(result.units[1].datasheet.name).toBe(baseRoster.units[0].datasheet.name);
    expect(result.summary.missing).toBe(1);
    expect(result.summary.ok + result.summary.partial).toBe(1);
  });

  it('refreshCollectionDataWithReport updates datasheets, recalculates points, and dataVersion', async () => {
    const refreshedDatasheet = buildDatasheet({ name: 'Updated', slug: 'unit-one-new' });

    const { collection: result } = await refreshCollectionDataWithReport({
      collection: baseCollection,
      currentDataVersion: 'new-version',
      getDatasheet: vi.fn().mockResolvedValue(refreshedDatasheet)
    });

    expect(result.dataVersion).toBe('new-version');
    expect(result.items[0].datasheetSlug).toBe('unit-one-new');
    expect(result.points.current).toBe(10);
  });

  it('falls back to name match via faction manifest when ids change', async () => {
    const refreshedDatasheet = buildDatasheet({
      id: 'ds-new',
      slug: 'unit-one-renamed',
      name: 'Unit One',
      modelCosts: [{ datasheetId: 'ds-new', line: '1', description: '10', cost: '15' }]
    });

    const getDatasheet = vi
      .fn()
      .mockResolvedValueOnce(null) // id miss
      .mockResolvedValueOnce(null) // slug miss
      .mockResolvedValueOnce(refreshedDatasheet); // after name match

    const getFactionManifest = vi.fn().mockResolvedValue({
      id: 'faction-1',
      slug: 'faction-1',
      name: 'Faction',
      link: '',
      datasheets: [
        {
          id: 'ds-new',
          slug: 'unit-one-renamed',
          name: 'Unit One',
          factionId: 'faction-1',
          factionSlug: 'faction-1',
          isSupport: false,
          path: '',
          link: '',
          isForgeWorld: false,
          isLegends: false
        }
      ],
      detachments: [],
      datasheetCount: 1,
      detachmentCount: 0
    });

    const result = await refreshCollectionDataWithReport({
      collection: baseCollection,
      currentDataVersion: 'new-version',
      getDatasheet,
      getFactionManifest
    });

    expect(result.summary.ok).toBe(1);
    expect(result.collection.items[0].datasheet.id).toBe('ds-new');
    expect(result.collection.items[0].modelCost.cost).toBe('15');
  });

  it('keeps missing units and reports them', async () => {
    const result = await refreshCollectionDataWithReport({
      collection: baseCollection,
      currentDataVersion: 'new-version',
      getDatasheet: vi.fn().mockResolvedValue(null)
    });

    expect(result.summary.missing).toBe(1);
    expect(result.collection.items[0].datasheet.id).toBe('ds-1');
    expect(result.collection.dataVersion).toBe('new-version');
  });

  it('throws when currentDataVersion is missing for roster refresh', async () => {
    await expect(
      refreshRosterDataWithReport({
        roster: baseRoster,
        currentDataVersion: null,
        getDatasheet: vi.fn(),
        getFactionManifest: vi.fn()
      })
    ).rejects.toThrow('currentDataVersion is required');
  });

  it('throws when currentDataVersion is missing for collection refresh', async () => {
    await expect(
      refreshCollectionDataWithReport({
        collection: baseCollection,
        currentDataVersion: null,
        getDatasheet: vi.fn()
      })
    ).rejects.toThrow('currentDataVersion is required');
  });

  it('formatRebindSummaryMessage describes partial and missing counts', () => {
    expect(formatRebindSummaryMessage({ ok: 2, partial: 0, missing: 0 })).toBeNull();
    expect(formatRebindSummaryMessage({ ok: 1, partial: 2, missing: 1 })).toContain(
      '2 units partially matched'
    );
    expect(formatRebindSummaryMessage({ ok: 0, partial: 0, missing: 1 })).toContain(
      '1 unit not found'
    );
  });
});

describe('hydration of saved documents', () => {
  const datasheet: depot.Datasheet = {
    id: 'ds-1',
    slug: 'unit-one',
    name: 'Unit One',
    factionId: 'faction-1',
    factionSlug: 'faction-1',
    sourceId: 'src',
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
    wargear: [
      { id: 'w1', datasheetId: 'ds-1', line: '1', name: 'Bolter', type: 'Ranged', profiles: [] }
    ],
    unitComposition: [],
    modelCosts: [{ datasheetId: 'ds-1', line: '1', description: '5 models', cost: '90' }],
    stratagemIds: [],
    leaders: [],
    isForgeWorld: false,
    isLegends: false
  };

  const detachment: depot.Detachment = {
    id: 'det-1',
    slug: 'det-1',
    name: 'Detachment',
    legend: '',
    type: '',
    dp: '',
    forceDisposition: '',
    chapterDp: [],
    abilities: [],
    enhancements: [
      {
        id: 'enh-1',
        factionId: 'faction-1',
        name: 'Relic',
        legend: '',
        description: '',
        cost: '15',
        detachment: 'Detachment'
      }
    ],
    stratagems: []
  };

  const catalog = {
    getDatasheet: vi.fn().mockResolvedValue(datasheet),
    getFactionManifest: vi.fn().mockResolvedValue({
      id: 'faction-1',
      slug: 'faction-1',
      name: 'Faction',
      link: '',
      datasheets: [],
      detachments: [detachment],
      datasheetCount: 0,
      detachmentCount: 1
    })
  };

  const storedRoster: depot.StoredRoster = {
    id: 'r1',
    name: 'Slim Roster',
    factionId: 'faction-1',
    factionSlug: 'faction-1',
    dataVersion: 'v1',
    detachments: [{ id: 'det-1', slug: 'det-1', name: 'Detachment' }],
    points: { current: 105, max: 2000 },
    warlordUnitId: 'u1',
    units: [
      {
        id: 'u1',
        datasheet: { id: 'ds-1', slug: 'unit-one', name: 'Unit One', factionSlug: 'faction-1' },
        datasheetSlug: 'unit-one',
        modelCost: { datasheetId: 'ds-1', line: '1', description: '5 models', cost: '90' },
        selectedWargear: [{ id: 'w1', name: 'Bolter' }],
        selectedWargearAbilities: []
      }
    ],
    enhancements: [
      {
        enhancement: { id: 'enh-1', name: 'Relic', cost: '15', detachment: 'Detachment' },
        unitId: 'u1'
      }
    ]
  };

  it('rebuilds units, detachments and enhancements from the catalog', async () => {
    const roster = await hydrateRoster(storedRoster, catalog);

    expect(roster.units[0].datasheet).toEqual(datasheet);
    expect(roster.units[0].selectedWargear[0].datasheetId).toBe('ds-1');
    expect(roster.detachments[0]).toEqual(detachment);
    expect(roster.enhancements[0].enhancement.factionId).toBe('faction-1');
    expect(roster.points).toEqual({ current: 105, max: 2000 });
    expect(roster.dataVersion).toBe('v1');
  });

  it('falls back to an empty datasheet when the catalog no longer has the unit', async () => {
    const roster = await hydrateRoster(storedRoster, {
      ...catalog,
      getDatasheet: vi.fn().mockResolvedValue(null),
      getFactionManifest: vi.fn().mockResolvedValue(null)
    });

    expect(roster.units[0].datasheet.name).toBe('Unit One');
    expect(roster.units[0].datasheet.wargear).toEqual([]);
    expect(roster.detachments[0].name).toBe('Detachment');
  });

  it('hydrates collection items and keeps their painted state', async () => {
    const collection = await hydrateCollection(
      {
        id: 'c1',
        name: 'Slim Collection',
        factionId: 'faction-1',
        factionSlug: 'faction-1',
        dataVersion: 'v1',
        points: { current: 90 },
        items: [{ ...storedRoster.units[0], state: 'built' }]
      },
      catalog
    );

    expect(collection.items[0].datasheet).toEqual(datasheet);
    expect(collection.items[0].state).toBe('built');
  });
});
