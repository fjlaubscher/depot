import type { depot } from '@depot/core';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface CategorizedAbilities {
  inline: depot.Ability[];
  referenced: depot.Ability[];
}

/**
 * Categorizes abilities into inline (unit-specific) and referenced (core/faction) groups.
 */
export const categorizeAbilities = (abilities: depot.Ability[]): CategorizedAbilities => {
  const inline: depot.Ability[] = [];
  const referenced: depot.Ability[] = [];

  abilities.forEach((ability) => {
    if (ability.type === 'Datasheet' || ability.type === 'Wargear') {
      inline.push(ability);
      return;
    }

    if (ability.type === 'Core' || ability.type === 'Faction') {
      referenced.push(ability);
      return;
    }

    if (ability.type.includes('Special') || ability.type.includes('Fortification')) {
      inline.push(ability);
      return;
    }

    if (ability.id) {
      referenced.push(ability);
    } else {
      inline.push(ability);
    }
  });

  return { inline, referenced };
};

/**
 * Maps ability type to pill badge styles used across the app.
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

/**
 * Converts ability type to a Tag variant for consistent styling.
 */
export const getAbilityTagVariant = (type: string): TagVariant => {
  const normalized = type.toLowerCase();

  if (normalized.includes('core')) {
    return 'primary';
  }

  if (normalized.includes('faction')) {
    return 'secondary';
  }

  if (normalized.includes('datasheet')) {
    return 'success';
  }

  if (normalized.includes('wargear')) {
    return 'warning';
  }

  if (normalized.includes('special')) {
    return 'danger';
  }

  if (normalized.includes('fortification')) {
    return 'warning';
  }

  return 'default';
};
