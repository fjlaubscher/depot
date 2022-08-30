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

export const groupDatasheetsByRole = (datasheets: Wahapedia.Datasheet[]) => {
  let dictionary: { [role: string]: Wahapedia.Datasheet[] } = {
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

  return dictionary;
};
