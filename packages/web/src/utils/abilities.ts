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
        color: 'surface-info-strong text-info-strong'
      };
    case 'Faction':
      return {
        text: 'Faction',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
    case 'Datasheet':
      return {
        text: 'Unit',
        color: 'surface-success-strong text-success-strong'
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
        color: 'surface-danger-strong text-danger-strong'
      };
    case 'Fortification (левая колонка)':
    case 'Fortification':
      return {
        text: 'Fortification',
        color: 'surface-warning-strong text-warning-strong'
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

export const formatAbilityName = (ability: depot.Ability): string => {
  const name = ability.name?.trim() ?? '';
  const parameter = ability.parameter?.trim();

  if (parameter) {
    return `${name} ${parameter}`.trim();
  }

  return name;
};
