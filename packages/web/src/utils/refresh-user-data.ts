import type { depot } from '@depot/core';
import {
  applyCollectionRebind,
  matchDatasheetSummary,
  rebindCollectionUnit,
  rebindRosterUnit,
  summarizeRebindStatuses,
  unitDatasheetIdentity,
  type RebindCollectionResult,
  type RebindStatus
} from '@depot/core/utils/rebind';
import { calculateTotalPoints, getRosterDetachments } from '@depot/core/utils/roster';
import { matchDetachment } from '@depot/core/utils/detachments';
import { placeholderDetachment } from '@depot/core/utils/saved';

type GetDatasheet = (
  factionSlug: string,
  datasheetIdOrSlug: string
) => Promise<depot.Datasheet | null>;

type GetFactionManifest = (slug: string) => Promise<depot.FactionManifest | null>;

export interface RefreshRosterParams {
  roster: depot.Roster;
  currentDataVersion: string | null;
  getDatasheet: GetDatasheet;
  getFactionManifest: GetFactionManifest;
}

export type RebindSummary = Record<RebindStatus, number>;

export type RefreshRosterResult = {
  roster: depot.Roster;
  summary: RebindSummary;
};

export interface RefreshCollectionParams {
  collection: depot.Collection;
  currentDataVersion: string | null;
  getDatasheet: GetDatasheet;
  getFactionManifest?: GetFactionManifest;
}

/**
 * Resolve a datasheet for a stored unit: id → slug → name (via faction manifest).
 */
export const resolveDatasheetForUnit = async (
  unit: { datasheet: depot.DatasheetRef; datasheetSlug?: string },
  factionSlug: string | undefined,
  getDatasheet: GetDatasheet,
  getFactionManifest?: GetFactionManifest,
  manifestCache?: Map<string, depot.FactionManifest | null>
): Promise<depot.Datasheet | null> => {
  const identity = unitDatasheetIdentity(unit);
  const slug = unit.datasheet.factionSlug || factionSlug;
  if (!slug) return null;

  const keys = [identity.id, identity.slug].filter((value): value is string => Boolean(value));
  for (const key of keys) {
    const fetched = await getDatasheet(slug, key);
    if (fetched) return fetched;
  }

  if (!getFactionManifest || !identity.name) {
    return null;
  }

  let manifest: depot.FactionManifest | null | undefined;
  if (manifestCache?.has(slug)) {
    manifest = manifestCache.get(slug);
  } else {
    manifest = await getFactionManifest(slug);
    manifestCache?.set(slug, manifest);
  }

  if (!manifest?.datasheets?.length) {
    return null;
  }

  const summary = matchDatasheetSummary(identity, manifest.datasheets);
  if (!summary) return null;

  return getDatasheet(slug, summary.id || summary.slug);
};

/** Rebind roster units onto the current catalog (id → slug → name). */
export const rebindRosterUnits = async (
  units: (depot.StoredRosterUnit | depot.RosterUnit)[],
  factionSlug: string | undefined,
  getDatasheet: GetDatasheet,
  getFactionManifest?: GetFactionManifest,
  manifestCache = new Map<string, depot.FactionManifest | null>()
): Promise<{ units: depot.RosterUnit[]; summary: RebindSummary }> => {
  const results = await Promise.all(
    units.map(async (unit) =>
      rebindRosterUnit(
        unit,
        await resolveDatasheetForUnit(
          unit,
          factionSlug,
          getDatasheet,
          getFactionManifest,
          manifestCache
        )
      )
    )
  );
  return {
    units: results.map((result) => result.unit),
    summary: summarizeRebindStatuses(results.map((result) => result.status))
  };
};

export const refreshRosterDataWithReport = async ({
  roster,
  currentDataVersion,
  getDatasheet,
  getFactionManifest
}: RefreshRosterParams): Promise<RefreshRosterResult> => {
  if (!currentDataVersion) {
    throw new Error('currentDataVersion is required to refresh roster data');
  }

  const factionSlug = roster.factionSlug || roster.faction?.slug || roster.factionId;
  const manifest = factionSlug ? await getFactionManifest(factionSlug) : null;
  const resolvedDetachments = getRosterDetachments(roster).map(
    (detachment) => matchDetachment(detachment, manifest?.detachments ?? []) ?? detachment
  );

  const manifestCache = new Map<string, depot.FactionManifest | null>();
  if (factionSlug && manifest) {
    manifestCache.set(factionSlug, manifest);
  }

  const { units: updatedUnits, summary } = await rebindRosterUnits(
    roster.units,
    factionSlug,
    getDatasheet,
    getFactionManifest,
    manifestCache
  );

  const { detachment: _legacyDetachment, ...rest } = roster;
  const updatedRoster: depot.Roster = {
    ...rest,
    dataVersion: currentDataVersion,
    detachments: resolvedDetachments,
    units: updatedUnits
  };

  return {
    roster: {
      ...updatedRoster,
      points: { ...updatedRoster.points, current: calculateTotalPoints(updatedRoster) }
    },
    summary
  };
};

export const refreshCollectionDataWithReport = async ({
  collection,
  currentDataVersion,
  getDatasheet,
  getFactionManifest
}: RefreshCollectionParams): Promise<RebindCollectionResult> => {
  if (!currentDataVersion) {
    throw new Error('currentDataVersion is required to refresh collection data');
  }

  const factionSlug = collection.factionSlug || collection.faction?.slug || collection.factionId;
  const manifestCache = new Map<string, depot.FactionManifest | null>();

  const itemResults = await Promise.all(
    collection.items.map(async (item) => {
      const datasheet = await resolveDatasheetForUnit(
        item,
        factionSlug,
        getDatasheet,
        getFactionManifest,
        manifestCache
      );
      return rebindCollectionUnit(item, datasheet);
    })
  );

  return applyCollectionRebind(collection, itemResults, currentDataVersion);
};

export const formatRebindSummaryMessage = (summary: RebindSummary): string | null => {
  const { partial, missing } = summary;
  if (partial === 0 && missing === 0) return null;

  const parts: string[] = [];
  if (partial > 0) {
    parts.push(`${partial} unit${partial === 1 ? '' : 's'} partially matched (loadout changes)`);
  }
  if (missing > 0) {
    parts.push(`${missing} unit${missing === 1 ? '' : 's'} not found in the current catalog`);
  }
  return parts.join('. ') + '.';
};

export interface Catalog {
  getDatasheet: GetDatasheet;
  getFactionManifest: GetFactionManifest;
}

/**
 * Saves keep ids and selections only, so loading one resolves it against the
 * local game data. Legacy saves with an embedded datasheet take the same path.
 */
export const hydrateRoster = async (
  roster: depot.StoredRoster,
  { getDatasheet, getFactionManifest }: Catalog
): Promise<depot.Roster> => {
  const factionSlug = roster.factionSlug || roster.faction?.slug || roster.factionId;
  const manifest = factionSlug ? await getFactionManifest(factionSlug) : null;
  const manifestCache = new Map<string, depot.FactionManifest | null>();
  if (factionSlug) {
    manifestCache.set(factionSlug, manifest);
  }

  const detachments = getRosterDetachments(roster).map(
    (ref) => matchDetachment(ref, manifest?.detachments ?? []) ?? placeholderDetachment(ref)
  );
  const catalogEnhancements = new Map(
    detachments.flatMap((detachment) =>
      detachment.enhancements.map((enhancement) => [enhancement.id, enhancement] as const)
    )
  );

  const { units } = await rebindRosterUnits(
    roster.units,
    factionSlug,
    getDatasheet,
    getFactionManifest,
    manifestCache
  );

  const { detachment: _legacyDetachment, ...rest } = roster;
  return {
    ...rest,
    detachments,
    units,
    enhancements: roster.enhancements.map(({ enhancement, unitId }) => ({
      unitId,
      enhancement: catalogEnhancements.get(enhancement.id) ?? { ...enhancement, factionId: '' }
    }))
  };
};

export const hydrateCollection = async (
  collection: depot.StoredCollection,
  { getDatasheet, getFactionManifest }: Catalog
): Promise<depot.Collection> => {
  const factionSlug = collection.factionSlug || collection.faction?.slug || collection.factionId;
  const manifestCache = new Map<string, depot.FactionManifest | null>();

  const items = await Promise.all(
    collection.items.map(async (item) => {
      const datasheet = await resolveDatasheetForUnit(
        item,
        factionSlug,
        getDatasheet,
        getFactionManifest,
        manifestCache
      );
      return rebindCollectionUnit(item, datasheet).item;
    })
  );

  return { ...collection, items };
};
