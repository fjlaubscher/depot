import { describe, it, expect } from 'vitest';
import type { depot } from '@depot/core';

import {
  isExportedCollection,
  isExportedRoster,
  type ExportedCollection,
  type ExportedRoster
} from './export';

const baseRoster: depot.Roster = {
  id: 'r1',
  name: 'Test',
  factionId: 'f1',
  factionSlug: 'f1',
  detachment: {
    slug: 'det',
    name: 'Det',
    abilities: [],
    enhancements: [],
    stratagems: []
  },
  points: { current: 0, max: 2000 },
  warlordUnitId: null,
  units: [],
  enhancements: []
};

const baseCollection: depot.Collection = {
  id: 'c1',
  name: 'Coll',
  factionId: 'f1',
  factionSlug: 'f1',
  items: [],
  points: { current: 0 }
};

describe('isExportedRoster', () => {
  it('accepts valid export', () => {
    const payload: ExportedRoster = {
      kind: 'roster',
      version: 1,
      dataVersion: null,
      roster: baseRoster
    };
    expect(isExportedRoster(payload)).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(isExportedRoster({})).toBe(false);
    expect(
      isExportedRoster({
        kind: 'roster',
        version: 1,
        roster: { ...baseRoster, points: undefined as unknown as depot.Roster['points'] }
      })
    ).toBe(false);
  });
});

describe('isExportedCollection', () => {
  it('accepts valid export', () => {
    const payload: ExportedCollection = {
      kind: 'collection',
      version: 1,
      dataVersion: null,
      collection: baseCollection
    };
    expect(isExportedCollection(payload)).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(isExportedCollection({})).toBe(false);
    expect(
      isExportedCollection({
        kind: 'collection',
        version: 1,
        collection: {
          ...baseCollection,
          points: undefined as unknown as depot.Collection['points']
        }
      })
    ).toBe(false);
  });
});
