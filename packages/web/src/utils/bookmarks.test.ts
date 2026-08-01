import { describe, it, expect } from 'vitest';

import {
  bookmarkPath,
  createDatasheetBookmark,
  createFactionBookmark,
  datasheetBookmarkId,
  factionBookmarkId
} from './bookmarks';

describe('bookmark helpers', () => {
  it('builds stable ids', () => {
    expect(factionBookmarkId('space-marines')).toBe('faction:space-marines');
    expect(datasheetBookmarkId('space-marines', 'captain')).toBe(
      'datasheet:space-marines:captain'
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
  });
});
