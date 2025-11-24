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
