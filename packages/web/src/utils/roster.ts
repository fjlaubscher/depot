import type { depot } from '@depot/core';
import {
  generateRosterShareText as generateRosterShareTextCore,
  type GenerateRosterShareTextOptions
} from '@depot/core/utils/roster';
import { buildAbsoluteUrl } from '@/utils/paths';

export const generateRosterShareText = (
  roster: depot.Roster,
  factionName?: string,
  options: GenerateRosterShareTextOptions = {}
): string =>
  `${generateRosterShareTextCore(roster, factionName, options)}\n${buildAbsoluteUrl('/')}`;
