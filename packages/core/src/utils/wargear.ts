import { createSlugGenerator } from './slug.js';
import type { Datasheet, Wargear, WargearProfile } from '../types/depot.js';
import type { DatasheetWargear } from '../types/wahapedia.js';

const PROFILE_SEPARATOR = ' - ';

/** `Bolt rifle - frag` → ['Bolt rifle', 'frag']; anything without a two-sided separator is a bare name. */
const splitWargearName = (name: string): [baseName: string, profileName?: string] => {
  const trimmed = name?.trim() ?? '';
  const index = trimmed.indexOf(PROFILE_SEPARATOR);
  const base = index > -1 ? trimmed.slice(0, index).trim() : '';
  const profile = index > -1 ? trimmed.slice(index + PROFILE_SEPARATOR.length).trim() : '';
  return base && profile ? [base, profile] : [trimmed];
};

const getLineValue = (value: string | undefined, fallback: number) =>
  value?.trim() ? value : `${fallback}`;

/**
 * Groups Wahapedia wargear profiles (which are often flattened) into structured weapons with profiles.
 * This enables downstream consumers (CLI + Web) to treat multi-profile weapons as a single selectable item.
 */
export const groupWargearProfiles = (entries: DatasheetWargear[]): Wargear[] => {
  if (!entries || entries.length === 0) {
    return [];
  }

  const wargearSlug = createSlugGenerator('wargear');
  const grouped: Wargear[] = [];
  let groupIndex = -1;
  let currentGroup: Wargear | null = null;

  entries.forEach((entry, index) => {
    const [baseName, profileName] = splitWargearName(entry.name);
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
      const id = `${entry.datasheetId}:${wargearSlug(normalizedBaseName)}`;

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

const addNameMapping = (map: Map<string, Set<string>>, name: string | undefined, id: string) => {
  if (name) {
    const key = name.toLowerCase();
    map.set(key, (map.get(key) ?? new Set()).add(id));
  }
};

const normaliseLoadoutItem = (text: string) =>
  text
    .replace(/<[^>]*>/g, '')
    .replace(/^(a |an |the |and )/i, '')
    .trim()
    .toLowerCase();

/**
 * Splits a comma-separated string of weapon keywords and trims whitespace.
 */
export function parseWargearKeywords(description?: string): string[] {
  return (description ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

/**
 * Separates wargear into ranged, melee, and mixed categories.
 */
export function separateWargearByType(wargear: Wargear[]): {
  rangedWargear: Wargear[];
  meleeWargear: Wargear[];
  mixedWargear: Wargear[];
} {
  return {
    rangedWargear: wargear.filter((weapon) => weapon.type === 'Ranged'),
    meleeWargear: wargear.filter((weapon) => weapon.type === 'Melee'),
    mixedWargear: wargear.filter((weapon) => weapon.type !== 'Ranged' && weapon.type !== 'Melee')
  };
}

/**
 * Simple parser to extract wargear identifiers from a loadout string.
 */
export function parseLoadoutWargear(loadout: string, wargear: Wargear[]): string[] {
  if (!loadout || wargear.length === 0) return [];

  const wargearMap = new Map<string, Set<string>>();
  wargear.forEach((weapon) => {
    addNameMapping(wargearMap, weapon.name, weapon.id);
    weapon.profiles.forEach((profile) => {
      addNameMapping(wargearMap, profile.name, weapon.id);
      if (profile.profileName) {
        addNameMapping(wargearMap, `${weapon.name} ${profile.profileName}`, weapon.id);
        addNameMapping(wargearMap, `${weapon.name} - ${profile.profileName}`, weapon.id);
        addNameMapping(wargearMap, profile.profileName, weapon.id);
      }
    });
  });

  const equipmentPattern = /(?:equipped with|armed with):\s*(.+?)(?:\.|$)/i;
  const match = loadout.match(equipmentPattern);

  if (!match || !match[1]) return [];

  const equipmentItems = match[1]
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const foundWargear = new Set<string>();

  for (const rawItem of equipmentItems) {
    const cleanItem = normaliseLoadoutItem(rawItem);

    const exactMatches = wargearMap.get(cleanItem);
    if (exactMatches) {
      exactMatches.forEach((id) => foundWargear.add(id));
      continue;
    }

    for (const [wargearName, wargearIds] of wargearMap.entries()) {
      if (
        wargearName.startsWith(cleanItem) &&
        (wargearName === cleanItem || /^.+[\s-:]+.+/.test(wargearName.substring(cleanItem.length)))
      ) {
        wargearIds.forEach((id) => foundWargear.add(id));
      }
    }
  }

  return Array.from(foundWargear);
}

export function getDefaultWargearSelection(datasheet: Datasheet): Wargear[] {
  const loadoutMatches = new Set(parseLoadoutWargear(datasheet.loadout, datasheet.wargear));
  return datasheet.wargear.filter((weapon) => loadoutMatches.has(weapon.id));
}

export function formatWargearDisplayName(weapon: Wargear): string {
  if (!weapon.profiles || weapon.profiles.length <= 1) {
    return weapon.name;
  }

  const labels = Array.from(
    new Set(
      weapon.profiles
        .map((profile) => {
          if (profile.profileName) {
            return profile.profileName;
          }
          if (profile.name && profile.name !== weapon.name) {
            return profile.name.replace(`${weapon.name} - `, '').trim();
          }
          return profile.type === 'Ranged' ? 'Ranged' : 'Melee';
        })
        .filter((label): label is string => Boolean(label))
    )
  );

  return labels.length > 0 ? `${weapon.name} (${labels.join(' / ')})` : weapon.name;
}

// ponytail: legacy (ungrouped) wargear migration removed; stale offline caches are rebuilt via the
// IndexedDB version bump, so datasheets always arrive with grouped wargear.
export function normalizeDatasheetWargear(datasheet: Datasheet): Datasheet {
  return datasheet;
}

export function normalizeSelectedWargear(
  selection: Wargear[] = [],
  availableWargear: Wargear[]
): Wargear[] {
  if (selection.length === 0 || availableWargear.length === 0) {
    return [];
  }

  const availableMap = new Map(availableWargear.map((weapon) => [weapon.id, weapon]));
  return selection
    .map((weapon) => availableMap.get(weapon.id) ?? weapon)
    .filter((weapon, index, array) => array.findIndex((w) => w.id === weapon.id) === index);
}
