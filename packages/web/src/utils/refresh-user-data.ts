import type { depot } from '@depot/core';
import { normalizeDatasheetWargear, normalizeSelectedWargear } from '@/utils/wargear';
import { normalizeSelectedWargearAbilities } from '@/utils/abilities';
import { calculateTotalPoints } from '@/contexts/roster/utils';
import { calculateCollectionPoints } from '@/utils/collection';

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

export const refreshRosterData = async ({
  roster,
  currentDataVersion,
  getDatasheet,
  getFactionManifest
}: RefreshRosterParams): Promise<depot.Roster> => {
  if (!currentDataVersion) {
    throw new Error('currentDataVersion is required to refresh roster data');
  }

  const factionSlug = roster.factionSlug || roster.faction?.slug || roster.factionId;
  const manifest = factionSlug ? await getFactionManifest(factionSlug) : null;
  const resolvedDetachment =
    manifest?.detachments.find((entry) => entry.slug === roster.detachment?.slug) ??
    roster.detachment;

  const updatedUnits = await Promise.all(
    roster.units.map(async (unit) => {
      const slug = unit.datasheet.factionSlug || factionSlug;
      const datasheetKey = unit.datasheet.id || unit.datasheet.slug;

      if (!slug || !datasheetKey) {
        return unit;
      }

      const fetched = await getDatasheet(slug, datasheetKey);
      if (!fetched) {
        return unit;
      }

      const normalized = normalizeDatasheetWargear(fetched);
      return {
        ...unit,
        datasheet: normalized,
        datasheetSlug: normalized.slug,
        selectedWargear: normalizeSelectedWargear(unit.selectedWargear, normalized.wargear),
        selectedWargearAbilities: normalizeSelectedWargearAbilities(
          unit.selectedWargearAbilities,
          normalized.abilities
        )
      };
    })
  );

  const updatedRoster: depot.Roster = {
    ...roster,
    dataVersion: currentDataVersion,
    detachment: resolvedDetachment,
    units: updatedUnits
  };

  return {
    ...updatedRoster,
    points: { ...updatedRoster.points, current: calculateTotalPoints(updatedRoster) }
  };
};

export interface RefreshCollectionParams {
  collection: depot.Collection;
  currentDataVersion: string | null;
  getDatasheet: GetDatasheet;
}

export const refreshCollectionData = async ({
  collection,
  currentDataVersion,
  getDatasheet
}: RefreshCollectionParams): Promise<depot.Collection> => {
  if (!currentDataVersion) {
    throw new Error('currentDataVersion is required to refresh collection data');
  }

  const factionSlug = collection.factionSlug || collection.faction?.slug || collection.factionId;

  const updatedItems = await Promise.all(
    collection.items.map(async (item) => {
      const slug = item.datasheet.factionSlug || factionSlug;
      const datasheetKey = item.datasheet.id || item.datasheet.slug;

      if (!slug || !datasheetKey) {
        return item;
      }

      const fetched = await getDatasheet(slug, datasheetKey);
      if (!fetched) {
        return item;
      }

      const normalized = normalizeDatasheetWargear(fetched);
      return {
        ...item,
        datasheet: normalized,
        datasheetSlug: normalized.slug,
        selectedWargear: normalizeSelectedWargear(item.selectedWargear, normalized.wargear),
        selectedWargearAbilities: normalizeSelectedWargearAbilities(
          item.selectedWargearAbilities,
          normalized.abilities
        )
      };
    })
  );

  return {
    ...collection,
    dataVersion: currentDataVersion,
    items: updatedItems,
    points: { current: calculateCollectionPoints({ ...collection, items: updatedItems }) }
  };
};
