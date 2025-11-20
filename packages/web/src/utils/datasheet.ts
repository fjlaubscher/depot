import type { DatasheetListItem } from '@/types/datasheets';
import { sortByName } from './array';

export const groupDatasheetsByRole = <T extends DatasheetListItem>(datasheets: T[]) => {
  let dictionary: { [role: string]: T[] } = {};

  for (let i = 0; i < datasheets.length; i++) {
    const datasheet = datasheets[i];
    const datasheetsByRole = dictionary[datasheet.role];
    dictionary[datasheet.role] = datasheetsByRole ? [...datasheetsByRole, datasheet] : [datasheet];
  }

  Object.keys(dictionary).forEach((key) => {
    dictionary[key] = sortByName(dictionary[key]) as T[];
  });

  return dictionary;
};
