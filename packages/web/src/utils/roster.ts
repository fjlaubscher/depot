import type { depot } from '@depot/core';
import { rosterShare } from '@depot/core';
import {
  createRosterDuplicate as createRosterDuplicateCore,
  generateRosterMarkdown as generateRosterMarkdownBase,
  groupRosterUnitsByRole as groupRosterUnitsByRoleCore,
  type GenerateRosterMarkdownOptions as CoreRosterMarkdownOptions
} from '@depot/core/utils/roster';
import { buildAbsoluteUrl } from '@/utils/paths';

export const groupRosterUnitsByRole = groupRosterUnitsByRoleCore;

export const getRosterFactionName = (roster: depot.Roster): string => {
  return rosterShare.getRosterFactionName(roster);
};

export type GenerateRosterMarkdownOptions = CoreRosterMarkdownOptions;

export const generateRosterMarkdown = (
  roster: depot.Roster,
  factionName?: string,
  options: GenerateRosterMarkdownOptions = {}
): string => {
  const markdown = generateRosterMarkdownBase(roster, factionName, options);
  return `${markdown}\n${buildAbsoluteUrl('/')}`;
};

interface GenerateRosterShareTextOptions {
  includeWargear?: boolean;
  includeWargearAbilities?: boolean;
}

export const generateRosterShareText = (
  roster: depot.Roster,
  factionName?: string,
  options: GenerateRosterShareTextOptions = {}
): string => {
  const shareText = rosterShare.generateRosterShareText(roster, factionName, options);
  return `${shareText}\n${buildAbsoluteUrl('/')}`;
};

interface DuplicateRosterOptions {
  name?: string;
  dataVersion?: string | null;
}

export const createRosterDuplicate = (
  roster: depot.Roster,
  options: DuplicateRosterOptions = {}
): depot.Roster => createRosterDuplicateCore(roster, options);
