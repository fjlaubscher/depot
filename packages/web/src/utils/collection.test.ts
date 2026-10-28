import { afterEach, describe, expect, it } from 'vitest';
import type { depot } from '@depot/core';
import i18n from '@/i18n';
import { mockDatasheet } from '@/test/mock-data';
import { getCollectionChartCopy, getCollectionsSnapshotCopy, getReadyPercent } from './collection';

const unit: depot.CollectionUnit = {
  id: 'unit',
  datasheet: mockDatasheet,
  datasheetSlug: mockDatasheet.slug,
  modelCost: mockDatasheet.modelCosts[0],
  selectedWargear: [],
  state: 'battle-ready'
};
const makeCollection = (count: number): depot.Collection => ({
  id: 'collection',
  name: 'Mes Tyranides',
  factionId: 'TYR',
  items: Array.from({ length: count }, () => unit),
  points: { current: 0 }
});

afterEach(async () => {
  await i18n.changeLanguage('en');
});

describe('collection copy', () => {
  it.each([
    ['en', 0, 'No units yet'],
    ['en', 1, '1 unit'],
    ['en', 2, '2 units'],
    ['fr', 0, 'Aucune unité pour le moment'],
    ['fr', 1, '1 unité'],
    ['fr', 2, '2 unités']
  ])('%s chart with %i entries', async (language, count, heading) => {
    await i18n.changeLanguage(language);
    expect(getCollectionChartCopy(makeCollection(count), 80)).toEqual({
      heading,
      totalUnits: count
    });
  });

  it.each([
    ['en', 1, 1, '1 unit across 1 collection'],
    ['en', 2, 1, '2 units across 1 collection'],
    ['en', 1, 2, '1 unit across 2 collections'],
    ['en', 2, 2, '2 units across 2 collections'],
    ['fr', 1, 1, '1 unité dans 1 collection'],
    ['fr', 2, 1, '2 unités dans 1 collection'],
    ['fr', 1, 2, '1 unité dans 2 collections'],
    ['fr', 2, 2, '2 unités dans 2 collections']
  ])(
    '%s snapshot with %i entries in %i collections',
    async (language, count, collections, heading) => {
      await i18n.changeLanguage(language);
      const result = getCollectionsSnapshotCopy([
        makeCollection(count),
        ...Array.from({ length: collections - 1 }, () => makeCollection(0))
      ]);
      expect(result.heading).toBe(heading);
      expect(result.totalUnits).toBe(count);
      expect(result.items[0]).toBe(unit);
      expect(getReadyPercent(result.items)).toBe(100);
    }
  );

  it('localizes the empty snapshot', async () => {
    await i18n.changeLanguage('fr');
    expect(getCollectionsSnapshotCopy([]).heading).toBe('Commencez votre collection');
    expect(getReadyPercent([])).toBe(0);
  });
});
