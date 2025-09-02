import { depot } from '@depot/core';
import { sortByName } from './array';

export const groupEnhancementsByDetachment = (
  enhancements: depot.Enhancement[]
): Record<string, depot.Enhancement[]> => {
  const grouped = enhancements.reduce((acc, enhancement) => {
    const key = enhancement.detachment || 'General';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(enhancement);
    return acc;
  }, {} as Record<string, depot.Enhancement[]>);

  // Sort enhancements within each detachment
  Object.keys(grouped).forEach((key) => {
    grouped[key] = sortByName(grouped[key]) as depot.Enhancement[];
  });

  return grouped;
};

export const filterEnhancements = (
  enhancements: depot.Enhancement[],
  query: string,
  detachment?: string
): depot.Enhancement[] => {
  let filtered = detachment
    ? enhancements.filter((enhancement) => enhancement.detachment === detachment)
    : enhancements;

  if (query) {
    filtered = filtered.filter((enhancement) =>
      enhancement.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  return filtered;
};

export const getUniqueEnhancementDetachmentTypes = (
  enhancements: depot.Enhancement[]
): string[] => {
  return enhancements
    .map((enhancement) => enhancement.detachment)
    .filter((detachment, index, self) => detachment && self.indexOf(detachment) === index)
    .sort();
};

export const isEnhancementGroupedDataEmpty = (
  grouped: Record<string, depot.Enhancement[]>
): boolean => {
  return Object.keys(grouped).every((key) => grouped[key].length === 0);
};
