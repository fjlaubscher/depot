import type { Enhancement } from '../../types/depot.js';
import { sortByName } from './array.js';

export const groupEnhancementsByDetachment = (
  enhancements: Enhancement[]
): Record<string, Enhancement[]> => {
  const grouped = enhancements.reduce<Record<string, Enhancement[]>>((acc, enhancement) => {
    const key = enhancement.detachment || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(enhancement);
    return acc;
  }, {});

  Object.keys(grouped).forEach((key) => {
    grouped[key] = sortByName(grouped[key]) as Enhancement[];
  });

  return grouped;
};

export const filterEnhancements = (
  enhancements: Enhancement[],
  query: string,
  detachment?: string
): Enhancement[] => {
  let filtered = detachment
    ? enhancements.filter((enhancement) => enhancement.detachment === detachment)
    : enhancements;

  if (query) {
    const normalizedQuery = query.toLowerCase();
    filtered = filtered.filter((enhancement) =>
      enhancement.name.toLowerCase().includes(normalizedQuery)
    );
  }

  return filtered;
};

export const getUniqueEnhancementDetachmentTypes = (enhancements: Enhancement[]): string[] => {
  return enhancements
    .map((enhancement) => enhancement.detachment)
    .filter((detachment): detachment is string => Boolean(detachment))
    .filter((detachment, index, self) => self.indexOf(detachment) === index)
    .sort();
};

export const isEnhancementGroupedDataEmpty = (grouped: Record<string, Enhancement[]>): boolean => {
  return Object.keys(grouped).every((key) => grouped[key].length === 0);
};
