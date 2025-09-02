import { depot } from '@depot/core';
import { getFactionAlliance } from '@/utils/faction';

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

export const groupFactionsByAlliance = (factions: depot.Index[]): GroupedFactions => {
  return factions.reduce((acc, faction) => {
    const allianceKey = getFactionAlliance(faction.id).toLowerCase();
    const allianceFactions = acc[allianceKey] || [];

    return {
      ...acc,
      [allianceKey]: [...allianceFactions, faction].sort((a, b) => a.name.localeCompare(b.name))
    };
  }, {} as GroupedFactions);
};

export const createTabLabels = (hasMyFactions: boolean): string[] => {
  return [...(hasMyFactions ? ['My Factions'] : []), 'All Factions'];
};

export const hasMyFactions = (myFactions: depot.Index[] | undefined): boolean => {
  return myFactions ? myFactions.length > 0 : false;
};
