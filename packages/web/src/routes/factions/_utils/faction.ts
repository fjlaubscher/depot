import type { depot } from '@depot/core';
import { getFactionAlliance } from '@depot/core/utils/common';

export interface GroupedFactions {
  [key: string]: depot.Index[];
}

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

export const groupFactionsByAlliance = (factions: depot.Index[]): GroupedFactions => {
  const grouped = factions.reduce((acc, faction) => {
    const allianceKey = getFactionAlliance(faction.id).toLowerCase();
    const allianceFactions = acc[allianceKey] || [];

    return {
      ...acc,
      [allianceKey]: [...allianceFactions, faction].sort((a, b) => a.name.localeCompare(b.name))
    };
  }, {} as GroupedFactions);

  // Sort the alliance keys to ensure Unaligned comes last
  const sortedGrouped: GroupedFactions = {};
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a.toLowerCase() === 'unaligned') return 1;
    if (b.toLowerCase() === 'unaligned') return -1;
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  sortedKeys.forEach((key) => {
    sortedGrouped[key] = grouped[key];
  });

  return sortedGrouped;
};

export const createTabLabels = (): string[] => {
  return ['All Factions'];
};
