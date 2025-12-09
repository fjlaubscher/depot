import { describe, expect, it } from 'vitest';
import type { Collection, CollectionUnitState, Datasheet, ModelCost } from '../types/depot.js';
import {
  COLLECTION_UNIT_STATES,
  calculateCollectionPoints,
  createCollectionUnitFromDatasheet,
  getCollectionStateCounts
} from './collection.js';

const createModelCost = (overrides: Partial<ModelCost> = {}): ModelCost => ({
  datasheetId: overrides.datasheetId ?? 'ds-1',
  line: overrides.line ?? '1',
  description: overrides.description ?? 'Unit',
  cost: overrides.cost ?? '100'
});

const createDatasheet = (overrides: Partial<Datasheet> = {}): Datasheet => ({
  id: overrides.id ?? 'ds-1',
  slug: overrides.slug ?? 'test-unit',
  name: overrides.name ?? 'Test Unit',
  factionId: overrides.factionId ?? 'test',
  factionSlug: overrides.factionSlug ?? 'test',
  sourceId: overrides.sourceId ?? 'wahapedia',
  sourceName: overrides.sourceName ?? 'Wahapedia',
  supplementKey: overrides.supplementKey,
  supplementSlug: overrides.supplementSlug,
  supplementName: overrides.supplementName,
  supplementLabel: overrides.supplementLabel,
  isSupplement: overrides.isSupplement ?? false,
  legend: overrides.legend ?? '',
  role: overrides.role ?? 'Battleline',
  roleLabel: overrides.roleLabel ?? 'Battleline',
  loadout: overrides.loadout ?? '',
  transport: overrides.transport ?? '',
  virtual: overrides.virtual ?? false,
  leaderHead: overrides.leaderHead ?? '',
  leaderFooter: overrides.leaderFooter ?? '',
  damagedW: overrides.damagedW ?? '',
  damagedDescription: overrides.damagedDescription ?? '',
  link: overrides.link ?? '',
  abilities: overrides.abilities ?? [],
  keywords: overrides.keywords ?? [],
  models: overrides.models ?? [],
  options: overrides.options ?? [],
  wargear: overrides.wargear ?? [],
  unitComposition: overrides.unitComposition ?? [],
  modelCosts: overrides.modelCosts ?? [],
  stratagems: overrides.stratagems ?? [],
  enhancements: overrides.enhancements ?? [],
  detachmentAbilities: overrides.detachmentAbilities ?? [],
  leaders: overrides.leaders ?? [],
  isForgeWorld: overrides.isForgeWorld ?? false,
  isLegends: overrides.isLegends ?? false
});

const createCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: overrides.id ?? 'collection-1',
  name: overrides.name ?? 'My Collection',
  factionId: overrides.factionId ?? 'test',
  factionSlug: overrides.factionSlug ?? 'test',
  faction: overrides.faction ?? null,
  items: overrides.items ?? [],
  points: overrides.points ?? { current: 0 },
  dataVersion: overrides.dataVersion ?? null,
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  notes: overrides.notes ?? '',
  usePileOfShameLabel: overrides.usePileOfShameLabel ?? false
});

const createUnit = (state: CollectionUnitState, cost: string) => ({
  id: `unit-${state}-${cost}`,
  datasheet: createDatasheet(),
  datasheetSlug: 'test-unit',
  modelCost: createModelCost({ cost }),
  selectedWargear: [],
  selectedWargearAbilities: [],
  state
});

describe('collection utils', () => {
  it('summarises unit states correctly', () => {
    const units = [
      createUnit('sprue', '0'),
      createUnit('sprue', '0'),
      createUnit('built', '0'),
      createUnit('parade-ready', '0')
    ];

    const counts = getCollectionStateCounts(units);

    expect(counts.sprue).toBe(2);
    expect(counts.built).toBe(1);
    expect(counts['parade-ready']).toBe(1);
    expect(counts['battle-ready']).toBe(0);
  });

  it('calculates total collection points', () => {
    const collection = createCollection({
      items: [createUnit('sprue', '100'), createUnit('built', '145'), createUnit('sprue', '0')]
    });

    expect(calculateCollectionPoints(collection)).toBe(245);
  });

  it('creates collection units from datasheets with sane defaults', () => {
    const datasheet = createDatasheet({
      wargear: [],
      loadout: 'Every model is equipped with: Bolt pistol.'
    });
    const result = createCollectionUnitFromDatasheet(datasheet, createModelCost());

    expect(result.state).toBe('sprue');
    expect(result.datasheetSlug).toBe(datasheet.slug);
    expect(result.id).toBeTruthy();
    expect(COLLECTION_UNIT_STATES).toContain(result.state);
  });
});
