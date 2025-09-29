import type { depot } from '@depot/core';

export interface CategorizedAbilities {
  inline: depot.Ability[]; // Short, unit-specific (Datasheet, Wargear types)
  referenced: depot.Ability[]; // Long, core rules (Core, Faction types)
}

/**
 * Categorizes abilities into inline (unit-specific) and referenced (core rules)
 * Based on ability type from the source data:
 * - Inline: "Datasheet" and "Wargear" types (short, unit-specific)
 * - Referenced: "Core" and "Faction" types (long, detailed rules)
 */
export const categorizeAbilities = (abilities: depot.Ability[]): CategorizedAbilities => {
  const inline: depot.Ability[] = [];
  const referenced: depot.Ability[] = [];

  abilities.forEach((ability) => {
    if (ability.type === 'Datasheet' || ability.type === 'Wargear') {
      inline.push(ability);
    } else if (ability.type === 'Core' || ability.type === 'Faction') {
      referenced.push(ability);
    } else if (ability.type.includes('Special') || ability.type.includes('Fortification')) {
      // Special and Fortification types are typically unit-specific
      inline.push(ability);
    } else {
      // Fallback to ID-based categorization for any unknown types
      if (ability.id) {
        referenced.push(ability);
      } else {
        inline.push(ability);
      }
    }
  });

  return { inline, referenced };
};

/**
 * Gets a user-friendly badge color for the ability type
 */
export const getAbilityTypeBadge = (type: string): { text: string; color: string } => {
  switch (type) {
    case 'Core':
      return {
        text: 'Core',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      };
    case 'Faction':
      return {
        text: 'Faction',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
    case 'Datasheet':
      return {
        text: 'Unit',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    case 'Wargear':
      return {
        text: 'Wargear',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      };
    case 'Special (правая колонка)':
    case 'Special':
      return {
        text: 'Special',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };
    case 'Fortification (левая колонка)':
    case 'Fortification':
      return {
        text: 'Fortification',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      };
    default:
      return { text: type, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
  }
};
