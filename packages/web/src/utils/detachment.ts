import { depot } from '@depot/core';
import { sortByName } from './array';

export const groupDetachmentAbilitiesByDetachment = (
  abilities: depot.DetachmentAbility[]
): Record<string, depot.DetachmentAbility[]> => {
  const grouped = abilities.reduce((acc, ability) => {
    const key = ability.detachment || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(ability);
    return acc;
  }, {} as Record<string, depot.DetachmentAbility[]>);

  // Sort abilities within each detachment
  Object.keys(grouped).forEach((key) => {
    grouped[key] = sortByName(grouped[key]) as depot.DetachmentAbility[];
  });

  return grouped;
};

export const filterDetachmentAbilities = (
  abilities: depot.DetachmentAbility[],
  query: string,
  detachment?: string
): depot.DetachmentAbility[] => {
  let filtered = detachment
    ? abilities.filter((ability) => ability.detachment === detachment)
    : abilities;

  if (query) {
    filtered = filtered.filter((ability) =>
      ability.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  return filtered;
};

export const getUniqueDetachmentTypes = (abilities: depot.DetachmentAbility[]): string[] => {
  return abilities
    .map((ability) => ability.detachment)
    .filter((detachment, index, self) => detachment && self.indexOf(detachment) === index)
    .sort();
};

export const isGroupedDataEmpty = (grouped: Record<string, depot.DetachmentAbility[]>): boolean => {
  return Object.keys(grouped).every((key) => grouped[key].length === 0);
};
