import type { depot, wahapedia } from '@depot/core';
import { slug as slugUtils, wargear as wargearUtils } from '@depot/core';

type LegacyWargearProfile = wahapedia.DatasheetWargear;

const addNameMapping = (map: Map<string, Set<string>>, name: string | undefined, id: string) => {
  if (!name) {
    return;
  }

  const key = name.toLowerCase();
  const existing = map.get(key);
  if (existing) {
    existing.add(id);
  } else {
    map.set(key, new Set([id]));
  }
};

const normaliseLoadoutItem = (text: string) =>
  text
    .replace(/<[^>]*>/g, '')
    .replace(/^(a |an |the |and )/i, '')
    .trim()
    .toLowerCase();

const isGroupedWargearArray = (wargear: depot.Wargear[]): boolean =>
  wargear.every((weapon) => Array.isArray((weapon as depot.Wargear).profiles));

/**
 * Splits a comma-separated string of weapon keywords and trims whitespace
 * @param description - Comma-separated keyword string
 * @returns Array of trimmed keywords, or empty array if no description
 */
export function parseWargearKeywords(description?: string): string[] {
  if (!description) return [];

  return description
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}

/**
 * Separates wargear into ranged, melee, and mixed categories
 * @param wargear - Array of wargear items
 * @returns Object containing separated wargear arrays
 */
export function separateWargearByType(wargear: depot.Wargear[]): {
  rangedWargear: depot.Wargear[];
  meleeWargear: depot.Wargear[];
  mixedWargear: depot.Wargear[];
} {
  const ranged: depot.Wargear[] = [];
  const melee: depot.Wargear[] = [];
  const mixed: depot.Wargear[] = [];

  wargear.forEach((weapon) => {
    switch (weapon.type) {
      case 'Ranged':
        ranged.push(weapon);
        break;
      case 'Melee':
        melee.push(weapon);
        break;
      default:
        mixed.push(weapon);
        break;
    }
  });

  return { rangedWargear: ranged, meleeWargear: melee, mixedWargear: mixed };
}

/**
 * Simple parser to extract wargear identifiers from a loadout string
 * @param loadout - Loadout string (e.g., "Every model is equipped with: splinter rifle; close combat weapon.")
 * @param wargear - Available wargear options to match against
 * @returns Array of wargear ids found in the loadout
 */
export function parseLoadoutWargear(loadout: string, wargear: depot.Wargear[]): string[] {
  if (!loadout || wargear.length === 0) return [];

  // Map lowercase names to wargear ids for lookups
  const wargearMap = new Map<string, Set<string>>();
  wargear.forEach((weapon) => {
    addNameMapping(wargearMap, weapon.name, weapon.id);
    weapon.profiles.forEach((profile) => {
      addNameMapping(wargearMap, profile.name, weapon.id);
      if (profile.profileName) {
        addNameMapping(wargearMap, `${weapon.name} ${profile.profileName}`, weapon.id);
        addNameMapping(wargearMap, `${weapon.name} - ${profile.profileName}`, weapon.id);
        addNameMapping(wargearMap, `${weapon.name} – ${profile.profileName}`, weapon.id);
        addNameMapping(wargearMap, profile.profileName, weapon.id);
      }
    });
  });

  // Extract the equipment part after "equipped with:" or similar patterns
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

    // Fallback to partial matching for variants (e.g. "grenade launcher")
    for (const [wargearName, wargearIds] of wargearMap.entries()) {
      if (
        wargearName.startsWith(cleanItem) &&
        (wargearName === cleanItem ||
          /^.+[\s–\-:].+/.test(wargearName.substring(cleanItem.length)))
      ) {
        wargearIds.forEach((id) => foundWargear.add(id));
      }
    }
  }

  return Array.from(foundWargear);
}

export function getDefaultWargearSelection(datasheet: depot.Datasheet): depot.Wargear[] {
  if (!datasheet.loadout || datasheet.wargear.length === 0) {
    return [];
  }

  const loadoutMatches = new Set(parseLoadoutWargear(datasheet.loadout, datasheet.wargear));
  if (loadoutMatches.size === 0) {
    return [];
  }

  return datasheet.wargear.filter((weapon) => loadoutMatches.has(weapon.id));
}

export function formatWargearDisplayName(weapon: depot.Wargear): string {
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
            return profile.name.replace(`${weapon.name} – `, '').trim();
          }
          return profile.type === 'Ranged' ? 'Ranged' : 'Melee';
        })
        .filter((label): label is string => Boolean(label))
    )
  );

  return labels.length > 0 ? `${weapon.name} (${labels.join(' / ')})` : weapon.name;
}

export function normalizeDatasheetWargear(datasheet: depot.Datasheet): depot.Datasheet {
  if (!datasheet.wargear || datasheet.wargear.length === 0) {
    return datasheet;
  }

  if (isGroupedWargearArray(datasheet.wargear)) {
    return datasheet;
  }

  const legacyWargear = datasheet.wargear as unknown as LegacyWargearProfile[];
  const wargearSlug = slugUtils.createSlugGenerator(`${datasheet.slug ?? datasheet.id}-wargear`);
  const grouped = wargearUtils.groupWargearProfiles(legacyWargear, {
    createId: ({ baseName, groupIndex }) => {
      const label = baseName || `wargear-${groupIndex + 1}`;
      return `${datasheet.id}:${wargearSlug(label)}`;
    }
  });

  return {
    ...datasheet,
    wargear: grouped
  };
}

export function normalizeSelectedWargear(
  selection: depot.Wargear[] = [],
  availableWargear: depot.Wargear[]
): depot.Wargear[] {
  if (selection.length === 0 || availableWargear.length === 0) {
    return [];
  }

  if (isGroupedWargearArray(selection)) {
    const availableMap = new Map(availableWargear.map((weapon) => [weapon.id, weapon]));
    return selection
      .map((weapon) => availableMap.get(weapon.id) ?? weapon)
      .filter((weapon, index, array) => array.findIndex((w) => w.id === weapon.id) === index);
  }

  const legacySelection = selection as unknown as LegacyWargearProfile[];
  const matched = new Map<string, depot.Wargear>();

  legacySelection.forEach((legacy) => {
    const weapon = availableWargear.find((candidate) =>
      candidate.profiles.some(
        (profile) =>
          (!!legacy.line && profile.line === legacy.line) ||
          (!!legacy.lineInWargear && profile.lineInWargear === legacy.lineInWargear) ||
          profile.name === legacy.name ||
          candidate.name === legacy.name
      )
    );

    if (weapon) {
      matched.set(weapon.id, weapon);
    }
  });

  return Array.from(matched.values());
}
