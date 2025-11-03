import { describe, it, expect } from 'vitest';
import type { depot } from '@depot/core';
import {
  deriveSupplementMetadata,
  filterDatasheetsBySupplement,
  shouldResetSupplementSelection
} from './datasheet-supplements';

const makeDatasheet = (
  overrides: Partial<depot.Datasheet> & { slug: string; name?: string }
): depot.Datasheet => ({
  id: `id-${overrides.slug}`,
  slug: overrides.slug,
  name: overrides.name ?? overrides.slug,
  factionId: overrides.factionId ?? 'SM',
  factionSlug: overrides.factionSlug ?? 'space-marines',
  sourceId: overrides.sourceId ?? '000000139',
  sourceName: overrides.sourceName ?? 'Codex',
  supplementSlug: overrides.supplementSlug,
  supplementName: overrides.supplementName,
  legend: overrides.legend ?? '',
  role: overrides.role ?? 'Battleline',
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

describe('datasheet supplements utils', () => {
  const baseDatasheets = [
    makeDatasheet({ slug: 'tactical-squad' }),
    makeDatasheet({ slug: 'intercessors', supplementSlug: 'codex', supplementName: 'Codex' }),
    makeDatasheet({
      slug: 'death-company',
      supplementSlug: 'blood-angels',
      supplementName: 'Blood Angels'
    }),
    makeDatasheet({
      slug: 'ravenwing-black-knights',
      supplementSlug: 'dark-angels'
    })
  ];

  describe('deriveSupplementMetadata', () => {
    it('builds supplement options with friendly labels', () => {
      const metadata = deriveSupplementMetadata(baseDatasheets);

      expect(metadata).toEqual({
        hasSupplements: true,
        hasCodexDatasheets: true,
        options: [
          { label: 'All', value: 'all', count: 4 },
          { label: 'None', value: 'codex', count: 2 },
          { label: 'Blood Angels', value: 'blood-angels', count: 1 },
          { label: 'Dark Angels', value: 'dark-angels', count: 1 }
        ]
      });
    });

    it('flags absence of supplements', () => {
      const metadata = deriveSupplementMetadata([makeDatasheet({ slug: 'scouts' })]);

      expect(metadata).toEqual({
        hasSupplements: false,
        hasCodexDatasheets: true,
        options: []
      });
    });
  });

  describe('filterDatasheetsBySupplement', () => {
    it('returns all datasheets when selection is all', () => {
      const results = filterDatasheetsBySupplement(baseDatasheets, 'all');
      expect(results).toHaveLength(4);
    });

    it('includes only codex datasheets when codex selected', () => {
      const results = filterDatasheetsBySupplement(baseDatasheets, 'codex');
      expect(results.map((ds) => ds.slug)).toEqual(['tactical-squad', 'intercessors']);
    });

    it('includes supplement datasheets plus shared codex entries', () => {
      const results = filterDatasheetsBySupplement(baseDatasheets, 'blood-angels');
      expect(results.map((ds) => ds.slug)).toEqual([
        'death-company',
        'tactical-squad',
        'intercessors'
      ]);
    });
  });

  describe('shouldResetSupplementSelection', () => {
    it('requests reset when filtered results are empty but supplement has entries', () => {
      const resetNeeded = shouldResetSupplementSelection(
        [makeDatasheet({ slug: 'unit-a', supplementSlug: 'blood-angels' })],
        []
      );

      expect(resetNeeded).toBe(true);
    });

    it('does not reset when both collections are empty', () => {
      const resetNeeded = shouldResetSupplementSelection([], []);
      expect(resetNeeded).toBe(false);
    });
  });
});
