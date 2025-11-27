import { useEffect, useRef } from 'react';
import type { DatasheetFilters } from './use-datasheet-browser';
import type { DatasheetListItem } from '@/types/datasheets';
import type { SupplementMetadata } from '@/utils/datasheet-supplements';
import { shouldResetSupplementSelection } from '@/utils/datasheet-supplements';

interface UseSupplementSelectionGuardArgs<T extends DatasheetListItem> {
  filters?: DatasheetFilters;
  supplementMetadata: SupplementMetadata;
  normalizedSelectedSupplement: string;
  activeSupplementDatasheets: T[];
  filteredActiveSupplementDatasheets: T[];
  onResetSelection: () => void;
}

export const useSupplementSelectionGuard = <T extends DatasheetListItem>({
  filters,
  supplementMetadata,
  normalizedSelectedSupplement,
  activeSupplementDatasheets,
  filteredActiveSupplementDatasheets,
  onResetSelection
}: UseSupplementSelectionGuardArgs<T>) => {
  const prevFiltersRef = useRef<DatasheetFilters | undefined>(filters);
  const prevActiveSupplementDatasheetsRef = useRef<T[]>(activeSupplementDatasheets);

  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const prevActiveDatasheets = prevActiveSupplementDatasheetsRef.current;

    prevFiltersRef.current = filters;
    prevActiveSupplementDatasheetsRef.current = activeSupplementDatasheets;

    if (!supplementMetadata.hasSupplements || normalizedSelectedSupplement === 'all') {
      return;
    }

    const lostActiveDatasheets =
      prevActiveDatasheets.length > 0 && activeSupplementDatasheets.length === 0;

    if (lostActiveDatasheets) {
      onResetSelection();
      return;
    }

    const filtersInitialized = prevFilters !== undefined;
    const legendsChanged = prevFilters?.showLegends !== filters?.showLegends;
    const forgeWorldChanged = prevFilters?.showForgeWorld !== filters?.showForgeWorld;

    if (!filtersInitialized || (!legendsChanged && !forgeWorldChanged)) {
      return;
    }

    if (
      shouldResetSupplementSelection(activeSupplementDatasheets, filteredActiveSupplementDatasheets)
    ) {
      onResetSelection();
    }
  }, [
    activeSupplementDatasheets,
    filteredActiveSupplementDatasheets,
    filters,
    normalizedSelectedSupplement,
    onResetSelection,
    supplementMetadata.hasSupplements
  ]);
};
