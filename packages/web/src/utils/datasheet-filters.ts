import type { depot } from '@depot/core';

export interface DatasheetVisibilityFilters {
  showLegends?: boolean;
  showForgeWorld?: boolean;
}

export const filterDatasheetsBySettings = (
  datasheets: depot.Datasheet[],
  filters?: DatasheetVisibilityFilters
): depot.Datasheet[] => {
  if (!filters) {
    return datasheets;
  }

  return datasheets.filter((sheet) => {
    if (filters.showLegends === false && sheet.isLegends) {
      return false;
    }

    if (filters.showForgeWorld === false && sheet.isForgeWorld) {
      return false;
    }

    return true;
  });
};
