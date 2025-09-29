import type { depot } from '@depot/core';
import { sortByName } from './array';

export const groupDatasheetsByRole = (datasheets: depot.Datasheet[]) => {
  let dictionary: { [role: string]: depot.Datasheet[] } = {};

  for (let i = 0; i < datasheets.length; i++) {
    const datasheet = datasheets[i];
    const datasheetsByRole = dictionary[datasheet.role];
    dictionary[datasheet.role] = datasheetsByRole ? [...datasheetsByRole, datasheet] : [datasheet];
  }

  Object.keys(dictionary).forEach((key) => {
    dictionary[key] = sortByName(dictionary[key]) as depot.Datasheet[];
  });

  return dictionary;
};
