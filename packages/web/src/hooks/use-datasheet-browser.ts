import { useMemo, useState } from 'react';
import type { DatasheetListItem } from '@depot/core/utils/datasheets';
import {
  type DatasheetVisibilityFilters,
  filterDatasheetsBySettings
} from '@depot/core/utils/datasheets';
import { sortByName } from '@depot/core/utils/common';
import useDebounce from './use-debounce';

export type DatasheetFilters = DatasheetVisibilityFilters;

export interface UseDatasheetBrowserResult<T extends DatasheetListItem> {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  filteredDatasheets: T[];
  hasResults: boolean;
  totalCount: number;
  clearFilters: () => void;
}

const normalizeQuery = (value: string) => value.trim().toLowerCase();

export const useDatasheetBrowser = <T extends DatasheetListItem>(
  datasheets: T[],
  filters?: DatasheetFilters,
  debounceMs = 300
): UseDatasheetBrowserResult<T> => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);
  const normalizedQuery = normalizeQuery(debouncedQuery);

  const filteredBySettings = useMemo(
    () => filterDatasheetsBySettings(datasheets, filters),
    [datasheets, filters]
  );

  const totalCount = filteredBySettings.length;

  const filteredDatasheets = useMemo(() => {
    let result = filteredBySettings;

    if (normalizedQuery) {
      result = result.filter((sheet) => sheet.name.toLowerCase().includes(normalizedQuery));
    }

    return sortByName(result);
  }, [filteredBySettings, normalizedQuery]);

  const hasResults = filteredDatasheets.length > 0;

  const clearFilters = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    filteredDatasheets,
    hasResults,
    totalCount,
    clearFilters
  };
};
