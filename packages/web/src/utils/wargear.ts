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
