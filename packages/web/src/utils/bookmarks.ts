import type { depot } from '@depot/core';

export const factionBookmarkId = (factionSlug: string): string => `faction:${factionSlug}`;

export const datasheetBookmarkId = (factionSlug: string, datasheetSlug: string): string =>
  `datasheet:${factionSlug}:${datasheetSlug}`;

export const bookmarkPath = (bookmark: depot.Bookmark): string => {
  if (bookmark.kind === 'faction') {
    return `/faction/${bookmark.factionSlug}`;
  }
  return `/faction/${bookmark.factionSlug}/datasheet/${bookmark.datasheetSlug}`;
};

export const createFactionBookmark = (
  faction: Pick<depot.Index | depot.Faction | depot.FactionManifest, 'slug' | 'name'>
): depot.Bookmark => ({
  id: factionBookmarkId(faction.slug),
  kind: 'faction',
  factionSlug: faction.slug,
  name: faction.name,
  createdAt: new Date().toISOString()
});

export const createDatasheetBookmark = (
  faction: Pick<depot.Index | depot.Faction | depot.FactionManifest, 'slug' | 'name'>,
  datasheet: Pick<depot.Datasheet | depot.DatasheetSummary, 'slug' | 'name'>
): depot.Bookmark => ({
  id: datasheetBookmarkId(faction.slug, datasheet.slug),
  kind: 'datasheet',
  factionSlug: faction.slug,
  datasheetSlug: datasheet.slug,
  name: datasheet.name,
  factionName: faction.name,
  createdAt: new Date().toISOString()
});
