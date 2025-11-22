import { wargear, type depot } from '@depot/core';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface CategorizedAbilities {
  inline: depot.Ability[];
  referenced: depot.Ability[];
}

const normalizeAbilityType = (type: string | undefined): string => type?.toLowerCase().trim() ?? '';

const abilityTypePriority = (type: string): number => (type.includes('core') ? 0 : 1);

export const sortAbilitiesByType = (abilities: depot.Ability[]): depot.Ability[] => {
  return [...abilities].sort((a, b) => {
    const aType = normalizeAbilityType(a.type);
    const bType = normalizeAbilityType(b.type);

    const typePriorityDiff = abilityTypePriority(aType) - abilityTypePriority(bType);

    if (typePriorityDiff !== 0) {
      return typePriorityDiff;
    }

    if (aType !== bType) {
      return aType.localeCompare(bType);
    }

    return formatAbilityName(a).localeCompare(formatAbilityName(b));
  });
};

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

export const getWargearAbilities = (abilities: depot.Ability[]): depot.Ability[] => {
  return abilities.filter((ability) => normalizeAbilityType(ability.type) === 'wargear');
};

export const normalizeSelectedWargearAbilities = (
  selectedAbilities: depot.Ability[] | undefined,
  datasheetAbilities: depot.Ability[]
): depot.Ability[] => {
  if (!selectedAbilities || selectedAbilities.length === 0) {
    return [];
  }

  const wargearAbilities = getWargearAbilities(datasheetAbilities);
  const availableIds = new Set(wargearAbilities.map((ability) => ability.id));
  const uniqueAbilities: depot.Ability[] = [];

  selectedAbilities.forEach((ability) => {
    if (!ability?.id) return;
    if (!availableIds.has(ability.id)) return;
    if (uniqueAbilities.some((existing) => existing.id === ability.id)) return;

    const normalized = wargearAbilities.find((available) => available.id === ability.id) ?? ability;
    uniqueAbilities.push(normalized);
  });

  return uniqueAbilities;
};
