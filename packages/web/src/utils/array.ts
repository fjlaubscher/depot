export const sortByName = <T extends { name: string }>(items: T[]): T[] => {
  return [...items]
    .filter((item): item is T => !!item)
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
};

export const sortByType = <T extends { type: string }>(items: T[]): T[] => {
  return [...items]
    .filter((item): item is T => !!item)
    .sort((a, b) => {
      const typeA = a.type.toLowerCase();
      const typeB = b.type.toLowerCase();

      if (typeA < typeB) {
        return -1;
      }
      if (typeA > typeB) {
        return 1;
      }
      return 0;
    });
};
