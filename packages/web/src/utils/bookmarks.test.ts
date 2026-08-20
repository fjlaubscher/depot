import { describe, it, expect } from 'vitest';

import {
  bookmarkPath,
  createDatasheetBookmark,
  createDetachmentBookmark,
  createFactionBookmark,
  datasheetBookmarkId,
  detachmentBookmarkId,
  factionBookmarkId
} from './bookmarks';

describe('bookmark helpers', () => {
  it('builds stable ids', () => {
    expect(factionBookmarkId('space-marines')).toBe('faction:space-marines');
    expect(datasheetBookmarkId('space-marines', 'captain')).toBe('datasheet:space-marines:captain');
    expect(detachmentBookmarkId('space-marines', 'gladius-task-force')).toBe(
      'detachment:space-marines:gladius-task-force'
    );
  });

  it('builds paths for faction and datasheet bookmarks', () => {
    expect(
      bookmarkPath({
        id: 'faction:space-marines',
        kind: 'faction',
        factionSlug: 'space-marines',
        name: 'Space Marines',
        createdAt: '2020-01-01T00:00:00.000Z'
      })
    ).toBe('/faction/space-marines');

    expect(
      bookmarkPath({
        id: 'datasheet:space-marines:captain',
        kind: 'datasheet',
        factionSlug: 'space-marines',
        datasheetSlug: 'captain',
        name: 'Captain',
        createdAt: '2020-01-01T00:00:00.000Z'
      })
    ).toBe('/faction/space-marines/datasheet/captain');

    expect(
      bookmarkPath({
        id: 'detachment:space-marines:gladius-task-force',
        kind: 'detachment',
        factionSlug: 'space-marines',
        detachmentSlug: 'gladius-task-force',
        name: 'Gladius Task Force',
        createdAt: '2020-01-01T00:00:00.000Z'
      })
    ).toBe('/faction/space-marines/detachment/gladius-task-force');
  });

  it('creates faction and datasheet bookmarks', () => {
    const faction = createFactionBookmark({ slug: 'orks', name: 'Orks' });
    expect(faction.kind).toBe('faction');
    expect(faction.id).toBe('faction:orks');
    expect(faction.createdAt).toBeTruthy();

    const datasheet = createDatasheetBookmark(
      { slug: 'orks', name: 'Orks' },
      { slug: 'boyz', name: 'Boyz' }
    );
    expect(datasheet.kind).toBe('datasheet');
    expect(datasheet.id).toBe('datasheet:orks:boyz');
    if (datasheet.kind === 'datasheet') {
      expect(datasheet.factionName).toBe('Orks');
    }

    const detachment = createDetachmentBookmark(
      { slug: 'orks', name: 'Orks' },
      { slug: 'waaagh-tribe', name: 'Waaagh! Tribe' }
    );
    expect(detachment.kind).toBe('detachment');
    expect(detachment.id).toBe('detachment:orks:waaagh-tribe');
    if (detachment.kind === 'detachment') {
      expect(detachment.factionName).toBe('Orks');
    }
  });
});
