import type { depot } from '@depot/core';
import { getFactionAlliance, groupBy, sortByName } from '@depot/core/utils/common';

export const filterFactionsByQuery = (
  factions: depot.Index[] | null,
  query: string
): depot.Index[] => {
  if (!factions) return [];

  if (query) {
    return factions.filter((faction) => faction.name.toLowerCase().includes(query.toLowerCase()));
  }

  return factions;
};

export const filterFactionsBySettings = (
  factions: depot.Index[],
  settings: depot.Settings | null
): depot.Index[] => {
  if (!settings) return factions;

  return factions.filter((faction) => {
    const alliance = getFactionAlliance(faction.id).toLowerCase();

    // Filter out Unaligned if the setting is disabled
    if (alliance === 'unaligned' && settings.showUnaligned === false) {
      return false;
    }

    return true;
  });
};

/** Alliance -> factions sorted by name; alliances alphabetical with Unaligned last. */
export const groupFactionsByAlliance = (factions: depot.Index[]): Record<string, depot.Index[]> => {
  const grouped = groupBy(factions, (faction) => getFactionAlliance(faction.id).toLowerCase());
  const keys = [...grouped.keys()].sort((a, b) =>
    a === 'unaligned' ? 1 : b === 'unaligned' ? -1 : a.localeCompare(b)
  );
  return Object.fromEntries(keys.map((key) => [key, sortByName(grouped.get(key) ?? [])]));
};
