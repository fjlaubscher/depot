export const sortByName = (items: Required<{ name: string }>[]) => {
  return items
    .filter((item) => !!item)
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      } else if (nameA > nameB) {
        return 1;
      } else {
        return 0;
      }
    });
};

export const sortByType = (items: Required<{ type: string }>[]) => {
  return items
    .filter((item) => !!item)
    .sort((a, b) => {
      const nameA = a.type.toLowerCase();
      const nameB = b.type.toLowerCase();

      if (nameA < nameB) {
        return -1;
      } else if (nameA > nameB) {
        return 1;
      } else {
        return 0;
      }
    });
};
