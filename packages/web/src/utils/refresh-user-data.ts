import type { depot } from '@depot/core';
import {
  applyCollectionRebind,
  matchDatasheetSummary,
  rebindCollectionUnit,
  rebindRosterUnit,
  unitDatasheetIdentity,
  type RebindCollectionResult,
  type RebindStatus
} from '@depot/core/utils/rebind';
import { calculateTotalPoints, getRosterDetachments } from '@depot/core/utils/roster';
import { matchDetachment } from '@depot/core/utils/detachments';

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

export type RefreshRosterResult = {
  roster: depot.Roster;
  summary: { ok: number; partial: number; missing: number };
};

export interface RefreshCollectionParams {
  collection: depot.Collection;
  currentDataVersion: string | null;
  getDatasheet: GetDatasheet;
  getFactionManifest?: GetFactionManifest;
}

const emptySummary = () => ({ ok: 0, partial: 0, missing: 0 });

const addStatus = (
  summary: { ok: number; partial: number; missing: number },
  status: RebindStatus
) => {
  summary[status] += 1;
};

/**
 * Resolve a datasheet for a stored unit: id → slug → name (via faction manifest).
 */
export const resolveDatasheetForUnit = async (
  unit: { datasheet: depot.Datasheet; datasheetSlug?: string },
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

export const refreshRosterData = async ({
  roster,
  currentDataVersion,
  getDatasheet,
  getFactionManifest
}: RefreshRosterParams): Promise<depot.Roster> => {
  const result = await refreshRosterDataWithReport({
    roster,
    currentDataVersion,
    getDatasheet,
    getFactionManifest
  });
  return result.roster;
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

  const summary = emptySummary();
  const updatedUnits = await Promise.all(
    roster.units.map(async (unit) => {
      const datasheet = await resolveDatasheetForUnit(
        unit,
        factionSlug,
        getDatasheet,
        getFactionManifest,
        manifestCache
      );
      const rebound = rebindRosterUnit(unit, datasheet);
      addStatus(summary, rebound.status);
      return rebound.unit;
    })
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

export const refreshCollectionData = async ({
  collection,
  currentDataVersion,
  getDatasheet,
  getFactionManifest
}: RefreshCollectionParams): Promise<depot.Collection> => {
  const result = await refreshCollectionDataWithReport({
    collection,
    currentDataVersion,
    getDatasheet,
    getFactionManifest
  });
  return result.collection;
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

export const formatRebindSummaryMessage = (summary: {
  ok: number;
  partial: number;
  missing: number;
}): string | null => {
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
