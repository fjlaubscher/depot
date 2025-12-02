import { describe, it, expect, vi } from 'vitest';
import type { depot } from '@depot/core';
import { refreshRosterData, refreshCollectionData } from './refresh-user-data';

const buildDatasheet = (overrides?: Partial<depot.Datasheet>): depot.Datasheet => ({
  id: 'ds-1',
  slug: 'unit-one',
  name: 'Unit One',
  factionId: 'faction-1',
  factionSlug: 'faction-1',
  sourceId: 'src',
  sourceName: 'Source',
  legend: '',
  role: 'Battleline',
  roleLabel: 'Battleline',
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
    detachment: {
      slug: 'det-1',
      name: 'Old Detachment',
      abilities: [],
      enhancements: [],
      stratagems: []
    },
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
    enhancements: [],
    cogitatorAnalysis: null
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

  it('refreshRosterData updates datasheets, detachment, points, and dataVersion', async () => {
    const refreshedDatasheet = buildDatasheet({ name: 'Unit One Updated', slug: 'unit-one-new' });
    const refreshedDetachment: depot.Detachment = {
      slug: 'det-1',
      name: 'New Detachment',
      abilities: [],
      enhancements: [],
      stratagems: []
    };

    const result = await refreshRosterData({
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
    expect(result.detachment.name).toBe('New Detachment');
    expect(result.units[0].datasheet.name).toBe('Unit One Updated');
    expect(result.units[0].datasheetSlug).toBe('unit-one-new');
    expect(result.points.current).toBe(10); // unchanged because cost stayed the same
  });

  it('refreshCollectionData updates datasheets, recalculates points, and dataVersion', async () => {
    const refreshedDatasheet = buildDatasheet({ name: 'Updated', slug: 'unit-one-new' });

    const result = await refreshCollectionData({
      collection: baseCollection,
      currentDataVersion: 'new-version',
      getDatasheet: vi.fn().mockResolvedValue(refreshedDatasheet)
    });

    expect(result.dataVersion).toBe('new-version');
    expect(result.items[0].datasheetSlug).toBe('unit-one-new');
    expect(result.points.current).toBe(10);
  });

  it('throws when currentDataVersion is missing for roster refresh', async () => {
    await expect(
      refreshRosterData({
        roster: baseRoster,
        currentDataVersion: null,
        getDatasheet: vi.fn(),
        getFactionManifest: vi.fn()
      })
    ).rejects.toThrow('currentDataVersion is required');
  });

  it('throws when currentDataVersion is missing for collection refresh', async () => {
    await expect(
      refreshCollectionData({
        collection: baseCollection,
        currentDataVersion: null,
        getDatasheet: vi.fn()
      })
    ).rejects.toThrow('currentDataVersion is required');
  });
});
