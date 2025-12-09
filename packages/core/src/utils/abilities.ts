import type { Ability } from '../types/depot.js';
import { slugify } from './slug.js';

export interface CategorizedAbilities {
  inline: Ability[];
  referenced: Ability[];
}

const normalizeAbilityType = (type: string | undefined): string => type?.toLowerCase().trim() ?? '';

const abilityTypePriority = (type: string): number => (type.includes('core') ? 0 : 1);

export const sortAbilitiesByType = (abilities: Ability[]): Ability[] => {
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

export const categorizeAbilities = (abilities: Ability[]): CategorizedAbilities => {
  const inline: Ability[] = [];
  const referenced: Ability[] = [];

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

export const formatAbilityName = (ability: Ability): string => {
  const name = ability.name?.trim() ?? '';
  const parameter = ability.parameter?.trim();

  if (parameter) {
    return `${name} ${parameter}`.trim();
  }

  return name;
};

export const getWargearAbilities = (abilities: Ability[]): Ability[] => {
  return abilities.filter((ability) => normalizeAbilityType(ability.type) === 'wargear');
};

export const normalizeSelectedWargearAbilities = (
  selectedAbilities: Ability[] | undefined,
  datasheetAbilities: Ability[]
): Ability[] => {
  if (!selectedAbilities || selectedAbilities.length === 0) {
    return [];
  }

  const wargearAbilities = getWargearAbilities(datasheetAbilities);
  const availableIds = new Set(wargearAbilities.map((ability) => ability.id).filter(Boolean));
  const availableBySlug = new Map(
    wargearAbilities
      .map(
        (ability) => [slugify(formatAbilityName(ability) || ability.name || ''), ability] as const
      )
      .filter(([slug]) => Boolean(slug))
  );
  const uniqueAbilities: Ability[] = [];

  selectedAbilities.forEach((ability) => {
    if (!ability) return;
    const abilityId = ability.id;
    const abilitySlug = slugify(formatAbilityName(ability) || ability.name || '');

    let normalized: Ability | null = null;

    if (abilityId && availableIds.has(abilityId)) {
      if (uniqueAbilities.some((existing) => existing.id === abilityId)) return;
      normalized = wargearAbilities.find((available) => available.id === abilityId) ?? ability;
    } else if (abilitySlug && availableBySlug.has(abilitySlug)) {
      if (
        uniqueAbilities.some(
          (existing) => slugify(formatAbilityName(existing) || existing.name || '') === abilitySlug
        )
      ) {
        return;
      }
      normalized = availableBySlug.get(abilitySlug) ?? ability;
    }

    if (normalized) {
      if (!normalized.id && abilitySlug) {
        normalized = { ...normalized, id: abilitySlug };
      }
      uniqueAbilities.push(normalized);
    }
  });

  return uniqueAbilities;
};
