import { depot } from 'depot-core';
import { sortByName } from './array';

export const ROLES = [
  'HQ',
  'Troops',
  'Dedicated Transport',
  'Elites',
  'Fast Attack',
  'Flyers',
  'Heavy Support',
  'Lords of War',
  'Fortifications'
];

export const groupDatasheetsByRole = (datasheets: depot.Datasheet[]) => {
  let dictionary: { [role: string]: depot.Datasheet[] } = {
    HQ: [],
    Troops: [],
    'Dedicated Transport': [],
    Elites: [],
    'Fast Attack': [],
    Flyers: [],
    'Heavy Support': [],
    'Lords of War': [],
    Fortifications: []
  };

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
