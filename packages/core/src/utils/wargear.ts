import type { Wargear, WargearProfile } from '../types/depot.js';
import type { DatasheetWargear } from '../types/wahapedia.js';

const PROFILE_SEPARATORS = [' – ', ' - ', ' — '];

interface SplitNameResult {
  baseName: string;
  profileName?: string;
}

const splitWargearName = (name: string): SplitNameResult => {
  const trimmed = name?.trim() ?? '';

  if (!trimmed) {
    return { baseName: '' };
  }

  for (const separator of PROFILE_SEPARATORS) {
    const index = trimmed.indexOf(separator);
    if (index > -1) {
      const base = trimmed.slice(0, index).trim();
      const profile = trimmed.slice(index + separator.length).trim();

      if (base && profile) {
        return {
          baseName: base,
          profileName: profile
        };
      }
    }
  }

  return { baseName: trimmed };
};

export interface GroupWargearProfilesOptions {
  createId?: (context: { baseName: string; groupIndex: number; entry: DatasheetWargear }) => string;
}

const getLineValue = (value: string | undefined, fallback: number) => {
  if (value && value.trim().length > 0) {
    return value;
  }

  return `${fallback}`;
};

/**
 * Groups Wahapedia wargear profiles (which are often flattened) into structured weapons with profiles.
 * This enables downstream consumers (CLI + Web) to treat multi-profile weapons as a single selectable item.
 */
export const groupWargearProfiles = (
  entries: DatasheetWargear[],
  options: GroupWargearProfilesOptions = {}
): Wargear[] => {
  if (!entries || entries.length === 0) {
    return [];
  }

  const grouped: Wargear[] = [];
  let groupIndex = -1;
  let currentGroup: Wargear | null = null;

  entries.forEach((entry, index) => {
    const { baseName, profileName } = splitWargearName(entry.name);
    const normalizedBaseName = baseName || entry.name || `Wargear ${index + 1}`;

    const lineInWargear = parseInt(entry.lineInWargear || '1', 10);
    const shouldContinueCurrentGroup =
      currentGroup &&
      entry.datasheetId === currentGroup.datasheetId &&
      normalizedBaseName === currentGroup.name &&
      lineInWargear > 1;

    if (!shouldContinueCurrentGroup || !currentGroup) {
      groupIndex += 1;
      const fallbackLine = getLineValue(entry.line, groupIndex + 1);
      const id =
        options.createId?.({
          baseName: normalizedBaseName,
          groupIndex,
          entry
        }) ?? `${entry.datasheetId}:${fallbackLine}`;

      currentGroup = {
        id,
        datasheetId: entry.datasheetId,
        line: fallbackLine,
        name: normalizedBaseName,
        type: entry.type,
        profiles: []
      };
      grouped.push(currentGroup);
    }

    currentGroup.profiles.push({
      datasheetId: entry.datasheetId,
      line: getLineValue(entry.line, currentGroup.profiles.length + 1),
      lineInWargear: entry.lineInWargear || '1',
      dice: entry.dice,
      name: entry.name,
      profileName,
      description: entry.description,
      range: entry.range,
      type: entry.type,
      a: entry.a,
      bsWs: entry.bsWs,
      s: entry.s,
      ap: entry.ap,
      d: entry.d
    });
  });

  return grouped.map((group, index) => {
    const profileTypes = new Set(group.profiles.map((profile: WargearProfile) => profile.type));
    const derivedType = profileTypes.size === 1 ? group.profiles[0].type : 'Mixed';

    return {
      ...group,
      type: derivedType,
      line: group.profiles[0]?.line || group.line || `${index + 1}`
    };
  });
};
