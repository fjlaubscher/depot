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

export const parseDamageAndModels = (datasheet: depot.Datasheet): depot.Model[] => {
  const { col2, col3, col4, col5 } = datasheet.damage[0];
  const damage = datasheet.damage.slice(1);

  return [
    ...datasheet.models,
    ...damage.map(
      (d) =>
        ({
          ...datasheet.models[0],
          name: `${d.col1} wounds`,
          [col2.toLowerCase()]: d.col2,
          [col3.toLowerCase()]: d.col3,
          [col4.toLowerCase()]: d.col4,
          [col5.toLowerCase()]: d.col5,
          modelsPerUnit: '-',
          cost: '-'
        } as unknown as depot.Model)
    )
  ];
};
