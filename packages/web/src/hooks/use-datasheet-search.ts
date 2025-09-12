import { useMemo, useState } from 'react';
import { depot } from '@depot/core';
import { groupDatasheetsByRole } from '@/utils/datasheet';
import useDebounce from './use-debounce';

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
  debounceMs = 300
): UseDatasheetSearchResult => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const groupedDatasheets = useMemo(() => {
    const filteredDatasheets = debouncedQuery
      ? datasheets.filter((ds) => ds.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      : datasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, debouncedQuery]);

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
