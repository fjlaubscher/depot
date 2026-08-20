import { describe, it, expect, vi } from 'vitest';
import type { depot } from '@depot/core';
import { mockDatasheet } from '@/test/mock-data';

import {
  formatCollectionImportToast,
  importCollectionsFromFiles,
  remapCollectionIds
} from './import-collections';

const baseCollection: depot.Collection = {
  id: 'c1',
  name: 'My Guard',
  factionId: 'AM',
  factionSlug: 'astra-militarum',
  items: [],
  points: { current: 0 },
  dataVersion: 'old'
};

const exportPayload = (collection: depot.Collection) =>
  JSON.stringify({
    kind: 'collection',
    version: 1,
    dataVersion: 'old',
    collection
  });

const fileFrom = (name: string, contents: string): File =>
  new File([contents], name, { type: 'application/json' });

describe('importCollectionsFromFiles', () => {
  it('imports multiple valid files and remaps ids', async () => {
    const saved: depot.Collection[] = [];
    const files = [
      fileFrom('a.json', exportPayload({ ...baseCollection, name: 'A' })),
      fileFrom('b.json', exportPayload({ ...baseCollection, name: 'B' }))
    ];

    const result = await importCollectionsFromFiles(files, {
      dataVersion: 'new-version',
      saveCollection: async (collection) => {
        saved.push(collection);
      }
    });

    expect(result.imported).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
    expect(saved).toHaveLength(2);
    expect(saved[0].id).not.toBe('c1');
    expect(saved[0].dataVersion).toBe('old'); // no catalog access → left as-is (stale banner handles it)
    expect(saved.map((c) => c.name).sort()).toEqual(['A', 'B']);
  });

  it('migrates legacy exports onto the current catalog when it can', async () => {
    const saved: depot.Collection[] = [];
    const oldDatasheet: depot.Datasheet = {
      ...mockDatasheet,
      modelCosts: [
        { datasheetId: mockDatasheet.id, line: '9', description: '1 model', cost: '999' }
      ],
      wargear: []
    };
    const item: depot.CollectionUnit = {
      id: 'item-1',
      datasheet: oldDatasheet,
      modelCost: oldDatasheet.modelCosts[0],
      selectedWargear: [],
      state: 'sprue'
    };
    const getDatasheet = vi.fn(async () => mockDatasheet);

    const result = await importCollectionsFromFiles(
      [fileFrom('a.json', exportPayload({ ...baseCollection, items: [item] }))],
      { dataVersion: 'new-version', getDatasheet, saveCollection: async (c) => void saved.push(c) }
    );

    expect(getDatasheet).toHaveBeenCalledWith('space-marines', mockDatasheet.id);
    expect(saved[0].dataVersion).toBe('new-version');
    expect(saved[0].items[0].datasheet.modelCosts).toEqual(mockDatasheet.modelCosts);
    expect(saved[0].items[0].modelCost.cost).toBe(mockDatasheet.modelCosts[0].cost);
    expect(result.summary.ok + result.summary.partial).toBe(1);
  });

  it('skips invalid files and continues', async () => {
    const files = [
      fileFrom('good.json', exportPayload(baseCollection)),
      fileFrom('bad.json', '{ not a collection }'),
      fileFrom('wrong-kind.json', JSON.stringify({ kind: 'roster', version: 1 }))
    ];

    const result = await importCollectionsFromFiles(files, {
      dataVersion: 'new-version',
      getDatasheet: async () => null,
      saveCollection: async () => undefined
    });

    expect(result.imported).toHaveLength(1);
    expect(result.failed).toHaveLength(2);
    expect(result.failed.map((f) => f.fileName).sort()).toEqual(['bad.json', 'wrong-kind.json']);
  });
});

describe('remapCollectionIds', () => {
  it('assigns new collection and item ids', () => {
    const remapped = remapCollectionIds({
      ...baseCollection,
      items: [
        {
          id: 'item-1',
          datasheet: {
            id: 'ds',
            slug: 'unit',
            name: 'Unit',
            factionId: 'AM',
            factionSlug: 'astra-militarum',
            sourceId: 'core',
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
            isLegends: false
          },
          modelCost: { datasheetId: 'ds', line: '1', description: '1', cost: '50' },
          selectedWargear: [],
          state: 'sprue'
        }
      ]
    });

    expect(remapped.id).not.toBe(baseCollection.id);
    expect(remapped.items[0].id).not.toBe('item-1');
    expect(remapped.points.current).toBe(50);
  });
});

describe('formatCollectionImportToast', () => {
  it('reports full success', () => {
    const toast = formatCollectionImportToast({
      summary: { ok: 0, partial: 0, missing: 0 },
      imported: [baseCollection, baseCollection],
      failed: []
    });
    expect(toast.type).toBe('success');
    expect(toast.message).toContain('2 collections');
  });

  it('reports partial success', () => {
    const toast = formatCollectionImportToast({
      summary: { ok: 0, partial: 0, missing: 0 },
      imported: [baseCollection],
      failed: [{ fileName: 'x.json', reason: 'bad' }]
    });
    expect(toast.type).toBe('warning');
    expect(toast.message).toContain('1 of 2');
  });

  it('reports total failure', () => {
    const toast = formatCollectionImportToast({
      summary: { ok: 0, partial: 0, missing: 0 },
      imported: [],
      failed: [{ fileName: 'x.json', reason: 'Not a depot collection export' }]
    });
    expect(toast.type).toBe('error');
    expect(toast.message).toContain('Not a depot collection export');
  });
});
