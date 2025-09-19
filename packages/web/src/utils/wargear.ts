import { depot } from '@depot/core';

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
 * Separates wargear into ranged and melee categories
 * @param wargear - Array of wargear items
 * @returns Object containing separated ranged and melee wargear arrays
 */
export function separateWargearByType(wargear: depot.Wargear[]): {
  rangedWargear: depot.Wargear[];
  meleeWargear: depot.Wargear[];
} {
  const ranged: depot.Wargear[] = [];
  const melee: depot.Wargear[] = [];

  wargear.forEach((weapon) => {
    if (weapon.type === 'Ranged') {
      ranged.push(weapon);
    } else if (weapon.type === 'Melee') {
      melee.push(weapon);
    }
  });

  return { rangedWargear: ranged, meleeWargear: melee };
}

/**
 * Simple parser to extract wargear from loadout string
 * @param loadout - Loadout string (e.g., "Every model is equipped with: splinter rifle; close combat weapon.")
 * @param wargear - Available wargear options to match against
 * @returns Array of wargear line identifiers found in the loadout
 */
export function parseLoadoutWargear(loadout: string, wargear: depot.Wargear[]): string[] {
  if (!loadout || wargear.length === 0) return [];

  // Create a map of lowercase names to wargear line identifiers for O(1) lookup
  const wargearMap = new Map<string, string>();
  wargear.forEach((w) => {
    wargearMap.set(w.name.toLowerCase(), w.line);
  });

  // Extract the equipment part after "equipped with:" or similar patterns
  const equipmentPattern = /(?:equipped with|armed with):\s*(.+?)(?:\.|$)/i;
  const match = loadout.match(equipmentPattern);

  if (!match || !match[1]) return [];

  // Split by semicolons and clean up each item
  const equipmentItems = match[1]
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const foundWargear: string[] = [];

  for (const item of equipmentItems) {
    // Clean up the item - remove articles and basic cleanup
    const cleanItem = item
      .replace(/^(a |an |the |and )/i, '')
      .trim()
      .toLowerCase();

    // Try to find exact match using the map
    const matchedWargearLine = wargearMap.get(cleanItem);

    if (matchedWargearLine !== undefined) {
      foundWargear.push(matchedWargearLine);
    }
  }

  return foundWargear;
}
