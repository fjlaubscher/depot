import type { DatasheetListItem } from '@/types/datasheets';

export interface DatasheetVisibilityFilters {
  showLegends?: boolean;
  showForgeWorld?: boolean;
}

export const filterDatasheetsBySettings = <T extends DatasheetListItem>(
  datasheets: T[],
  filters?: DatasheetVisibilityFilters
): T[] => {
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
