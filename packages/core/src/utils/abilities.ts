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

const isReferencedAbility = (ability: Ability): boolean =>
  ability.type === 'Core' ||
  ability.type === 'Faction' ||
  (ability.type !== 'Datasheet' &&
    ability.type !== 'Wargear' &&
    !ability.type.includes('Special') &&
    !ability.type.includes('Fortification') &&
    Boolean(ability.id));

export const categorizeAbilities = (abilities: Ability[]): CategorizedAbilities => ({
  inline: abilities.filter((ability) => !isReferencedAbility(ability)),
  referenced: abilities.filter(isReferencedAbility)
});

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
  if (!selectedAbilities?.length) {
    return [];
  }

  const slugOf = (ability: Ability) => slugify(formatAbilityName(ability) || ability.name || '');
  const available = new Map(
    getWargearAbilities(datasheetAbilities).flatMap((ability) =>
      [ability.id, slugOf(ability)].filter(Boolean).map((key) => [key, ability] as const)
    )
  );
  const normalized = new Map<string, Ability>();

  selectedAbilities.forEach((ability) => {
    if (!ability) return;
    const match = available.get(ability.id ?? '') ?? available.get(slugOf(ability));
    if (!match) return;
    const key = match.id || slugOf(match);
    if (key && !normalized.has(key)) {
      normalized.set(key, match.id ? match : { ...match, id: key });
    }
  });

  return [...normalized.values()];
};
