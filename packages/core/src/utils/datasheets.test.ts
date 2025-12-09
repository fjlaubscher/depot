import { describe, expect, it } from 'vitest';
import type { depot } from '../types/depot.js';
import {
  CODEX_SLUG,
  buildSupplementLabel,
  deriveSupplementMetadata,
  filterDatasheetsBySettings,
  filterDatasheetsBySupplement,
  formatDetachmentOptionLabel,
  formatDetachmentSupplementLabel,
  getSupplementKey,
  groupDatasheetsByRole,
  isCodexEntry,
  isSupplementEntry,
  normalizeSupplementValue,
  shouldResetSupplementSelection,
  sortDatasheetsBySupplementPreference
} from './datasheets.js';

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
  supplementKey: overrides.supplementKey,
  supplementSlug: overrides.supplementSlug,
  supplementName: overrides.supplementName,
  supplementLabel: overrides.supplementLabel,
  isSupplement: overrides.isSupplement,
  legend: overrides.legend ?? '',
  role: overrides.role ?? 'Battleline',
  roleLabel: overrides.roleLabel,
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

describe('datasheet utils', () => {
  describe('groupDatasheetsByRole', () => {
    it('groups datasheets and sorts within each role', () => {
      const grouped = groupDatasheetsByRole([
        makeDatasheet({ slug: 'intercessors', name: 'Intercessors', role: 'Battleline' }),
        makeDatasheet({ slug: 'aggressors', name: 'Aggressors', role: 'Battleline' }),
        makeDatasheet({ slug: 'captain', name: 'Captain', role: 'Leader' })
      ]);

      expect(Object.keys(grouped)).toEqual(['Battleline', 'Leader']);
      expect(grouped.Battleline.map((item) => item.name)).toEqual(['Aggressors', 'Intercessors']);
    });
  });

  describe('filterDatasheetsBySettings', () => {
    it('filters legends and forge world entries', () => {
      const datasheets = [
        makeDatasheet({ slug: 'core', isLegends: false, isForgeWorld: false }),
        makeDatasheet({ slug: 'legends', isLegends: true }),
        makeDatasheet({ slug: 'forge-world', isForgeWorld: true })
      ];

      const filtered = filterDatasheetsBySettings(datasheets, {
        showLegends: false,
        showForgeWorld: false
      });

      expect(filtered.map((item) => item.slug)).toEqual(['core']);
    });
  });

  describe('supplement helpers', () => {
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

    it('derives supplement metadata', () => {
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

    it('uses provided supplement key and label', () => {
      const metadata = deriveSupplementMetadata([
        makeDatasheet({ slug: 'core-unit', supplementKey: 'codex', isSupplement: false }),
        makeDatasheet({
          slug: 'angels-unit',
          supplementKey: 'blood-angels',
          supplementLabel: 'Blood Angels',
          isSupplement: true
        })
      ]);

      expect(metadata.options).toContainEqual({
        label: 'Blood Angels',
        value: 'blood-angels',
        count: 1
      });
    });

    it('filters datasheets by supplement and retains shared codex entries', () => {
      const results = filterDatasheetsBySupplement(
        [
          makeDatasheet({ slug: 'core-unit', isSupplement: false }),
          makeDatasheet({
            slug: 'keyed-unit',
            supplementKey: 'custom-supplement',
            isSupplement: true
          })
        ],
        'custom-supplement'
      );

      expect(results.map((ds) => ds.slug)).toEqual(['keyed-unit', 'core-unit']);
    });

    it('determines supplement identity helpers consistently', () => {
      const sheet = makeDatasheet({
        slug: 'supplement-unit',
        supplementSlug: 'blood-angels'
      });
      expect(normalizeSupplementValue(' Blood-Angels ')).toBe('blood-angels');
      expect(getSupplementKey(sheet)).toBe('blood-angels');
      expect(isSupplementEntry(sheet)).toBe(true);
      expect(isCodexEntry(sheet.supplementSlug)).toBe(false);
      expect(buildSupplementLabel(sheet.supplementSlug ?? '')).toBe('Blood Angels');
    });

    it('formats detachment labels for supplements', () => {
      expect(formatDetachmentSupplementLabel('blood-angels-legends', 'Blood Angels Legends')).toBe(
        'Blood Angels'
      );
      expect(formatDetachmentOptionLabel('Strike Force', 'blood-angels')).toBe(
        'Strike Force [Blood Angels]'
      );
    });

    it('sorts datasheets by supplement preference', () => {
      const sheets = [
        makeDatasheet({ slug: 'codex-unit', name: 'Codex Unit', isSupplement: false }),
        makeDatasheet({
          slug: 'blood-angels-unit',
          name: 'BA Unit',
          supplementSlug: 'blood-angels'
        }),
        makeDatasheet({
          slug: 'dark-angels-unit',
          name: 'DA Unit',
          supplementSlug: 'dark-angels'
        })
      ];

      const sorted = sortDatasheetsBySupplementPreference(sheets, 'blood-angels', true);
      expect(sorted.map((sheet) => sheet.slug)).toEqual([
        'blood-angels-unit',
        'codex-unit',
        'dark-angels-unit'
      ]);

      const codexSelected = sortDatasheetsBySupplementPreference(sheets, CODEX_SLUG, true);
      expect(codexSelected[0].slug).toBe('codex-unit');
    });
  });

  describe('supplement selection guard helpers', () => {
    it('flags reset requirement when supplement entries disappear post-filter', () => {
      const resetNeeded = shouldResetSupplementSelection(
        [makeDatasheet({ slug: 'unit-a', supplementSlug: 'blood-angels' })],
        []
      );

      expect(resetNeeded).toBe(true);
    });

    it('does not flag reset when both arrays are empty', () => {
      expect(shouldResetSupplementSelection([], [])).toBe(false);
    });
  });
});
