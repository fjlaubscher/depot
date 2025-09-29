import { useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import { groupDatasheetsByRole } from '@/utils/datasheet';
import useDebounce from './use-debounce';

export interface DatasheetFilters {
  showLegends?: boolean;
  showForgeWorld?: boolean;
}

export interface UseDatasheetSearchResult {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  groupedDatasheets: Record<string, depot.Datasheet[]>;
  sortedRoleKeys: string[];
  shouldExpandSection: Record<string, boolean>;
  hasResults: boolean;
}

export const useDatasheetSearch = (
  datasheets: depot.Datasheet[],
  filters?: DatasheetFilters,
  debounceMs = 300
): UseDatasheetSearchResult => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const groupedDatasheets = useMemo(() => {
    let filteredDatasheets = datasheets;

    // Apply settings filters
    if (filters) {
      if (filters.showLegends === false) {
        filteredDatasheets = filteredDatasheets.filter((ds) => ds.isLegends === false);
      }
      if (filters.showForgeWorld === false) {
        filteredDatasheets = filteredDatasheets.filter((ds) => ds.isForgeWorld === false);
      }
    }

    // Apply search filter
    filteredDatasheets = debouncedQuery
      ? filteredDatasheets.filter((ds) =>
          ds.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      : filteredDatasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, filters, debouncedQuery]);

  const sortedRoleKeys = useMemo(() => {
    return Object.keys(groupedDatasheets).sort();
  }, [groupedDatasheets]);

  const shouldExpandSection = useMemo(() => {
    if (debouncedQuery) {
      const expandedSections: Record<string, boolean> = {};
      sortedRoleKeys.forEach((key) => {
        expandedSections[key] = groupedDatasheets[key].length > 0;
      });
      return expandedSections;
    }
    return {};
  }, [debouncedQuery, sortedRoleKeys, groupedDatasheets]);

  const hasResults = useMemo(() => {
    return sortedRoleKeys.some((key) => groupedDatasheets[key].length > 0);
  }, [sortedRoleKeys, groupedDatasheets]);

  return {
    query,
    setQuery,
    debouncedQuery,
    groupedDatasheets,
    sortedRoleKeys,
    shouldExpandSection,
    hasResults
  };
};
