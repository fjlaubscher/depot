import { describe, expect, it } from 'vitest';
import { createSlugGenerator } from './slug.js';
import {
  buildFactionDetachments,
  formatChapterDpLine,
  matchDetachment,
  toDepotEnhancement
} from './detachments.js';
import type * as wahapedia from '../types/wahapedia.js';

const detachment = (
  overrides: Partial<wahapedia.Detachment> & Pick<wahapedia.Detachment, 'id' | 'name'>
): wahapedia.Detachment => ({
  factionId: 'SM',
  legend: '',
  type: '',
  dp: '2',
  forceDisposition: 'Take and Hold',
  ...overrides
});

describe('detachment helpers', () => {
  it('joins abilities, enhancements, stratagems, and chapter DP by id', () => {
    const built = buildFactionDetachments({
      factionId: 'SM',
      detachments: [
        detachment({
          id: '000000100',
          name: 'Gladius Task Force',
          legend: 'Codex doctrine.',
          dp: '2',
          forceDisposition: 'Take and Hold'
        }),
        detachment({
          id: '000000200',
          name: 'Shield of the Void',
          type: 'Boarding Actions',
          dp: '',
          forceDisposition: ''
        }),
        detachment({ id: '000000300', name: 'Other Faction', factionId: 'ORK' })
      ],
      chapterDp: [
        { detachmentId: '000000100', keyword: 'Black Templars', dp: '2' },
        { detachmentId: '000000999', keyword: 'Ignored', dp: '3' }
      ],
      abilities: [
        {
          id: 'ab-1',
          factionId: 'SM',
          name: 'Combat Doctrines',
          legend: '',
          description: 'Doctrines',
          detachment: 'Gladius Task Force',
          detachmentId: '000000100'
        }
      ],
      enhancements: [
        {
          id: 'en-1',
          factionId: 'SM',
          name: 'Artificer Armour',
          legend: '',
          description: 'Better armour',
          cost: '15',
          detachment: 'Gladius Task Force',
          detachmentId: '000000100',
          upgrade: 'true',
          supportLeader: '<span>LEADER:</span> Captain'
        }
      ],
      stratagems: [
        {
          id: 'st-1',
          factionId: 'SM',
          name: 'Fire Discipline',
          type: 'Battle Tactic',
          cpCost: '1',
          legend: '',
          turn: 'Your',
          phase: 'Shooting',
          description: 'Shoot better',
          detachment: 'Gladius Task Force',
          detachmentId: '000000100'
        },
        {
          id: 'st-orphan',
          factionId: 'SM',
          name: 'Orphan Stratagem',
          type: 'Battle Tactic',
          cpCost: '1',
          legend: '',
          turn: 'Your',
          phase: 'Any',
          description: 'Missing detachment',
          detachment: 'Missing',
          detachmentId: '000000404'
        }
      ],
      createSlug: createSlugGenerator('detachment')
    });

    expect(built.map((entry) => entry.name)).toEqual(['Gladius Task Force', 'Shield of the Void']);

    const gladius = built[0];
    expect(gladius).toMatchObject({
      id: '000000100',
      slug: 'gladius-task-force',
      dp: '2',
      forceDisposition: 'Take and Hold',
      type: '',
      legend: 'Codex doctrine.',
      chapterDp: [{ keyword: 'Black Templars', dp: '2' }]
    });
    expect(gladius.abilities.map((entry) => entry.name)).toEqual(['Combat Doctrines']);
    expect(gladius.enhancements[0]).toMatchObject({
      name: 'Artificer Armour',
      upgrade: true,
      supportLeader: '<span>LEADER:</span> Captain'
    });
    expect(gladius.stratagems.map((entry) => entry.name)).toEqual(['Fire Discipline']);

    expect(built[1]).toMatchObject({
      id: '000000200',
      slug: 'shield-of-the-void',
      type: 'Boarding Actions',
      dp: '',
      forceDisposition: '',
      chapterDp: []
    });
  });

  it('suffixes a short id when two detachments in the same faction share a name', () => {
    const built = buildFactionDetachments({
      factionId: 'CD',
      detachments: [
        detachment({
          id: '000000111',
          factionId: 'CD',
          name: 'Daemonic Incursion'
        }),
        detachment({
          id: '000000222',
          factionId: 'CD',
          name: 'Daemonic Incursion',
          type: 'Boarding Actions',
          dp: '',
          forceDisposition: ''
        })
      ],
      chapterDp: [],
      abilities: [],
      enhancements: [],
      stratagems: [],
      createSlug: createSlugGenerator('detachment')
    });

    expect(built.map((entry) => entry.slug).sort()).toEqual([
      'daemonic-incursion',
      'daemonic-incursion-222'
    ]);
  });

  it('maps upgrade/supportLeader onto depot enhancements', () => {
    expect(
      toDepotEnhancement({
        id: 'en-1',
        factionId: 'SM',
        name: 'The Honour Veil',
        legend: '',
        description: 'Fluff',
        cost: '15',
        detachment: 'Gladius',
        detachmentId: '1',
        upgrade: 'false',
        supportLeader: ''
      })
    ).toEqual({
      id: 'en-1',
      factionId: 'SM',
      name: 'The Honour Veil',
      legend: '',
      description: 'Fluff',
      cost: '15',
      detachment: 'Gladius'
    });
  });

  it('formats chapter DP lines', () => {
    expect(
      formatChapterDpLine([
        { keyword: 'Black Templars', dp: '2' },
        { keyword: 'Blood Angels', dp: '2' }
      ])
    ).toBe('Black Templars 2 DP, Blood Angels 2 DP');
  });

  it('resolves a saved detachment by id, then slug, then name', () => {
    const catalog = buildFactionDetachments({
      factionId: 'SM',
      detachments: [
        detachment({ id: '000000100', name: 'Gladius Task Force' }),
        detachment({ id: '000000200', name: 'Anvil Siege Force', dp: '3' })
      ],
      chapterDp: [],
      abilities: [],
      enhancements: [],
      stratagems: [],
      createSlug: createSlugGenerator('detachment')
    });

    expect(matchDetachment({ id: '000000200' }, catalog)?.name).toBe('Anvil Siege Force');
    expect(matchDetachment({ slug: 'gladius-task-force' }, catalog)?.id).toBe('000000100');
    expect(matchDetachment({ name: 'Gladius Task Force' }, catalog)?.id).toBe('000000100');
    expect(
      matchDetachment({ id: 'missing', slug: 'missing', name: 'Nope' }, catalog)
    ).toBeUndefined();
  });
});
