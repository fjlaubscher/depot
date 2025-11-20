import { useMemo, useState } from 'react';
import type { DatasheetListItem } from '@/types/datasheets';
import { groupDatasheetsByRole } from '@/utils/datasheet';
import {
  type DatasheetVisibilityFilters,
  filterDatasheetsBySettings
} from '@/utils/datasheet-filters';
import { sortByName } from '@/utils/array';
import useDebounce from './use-debounce';

export type DatasheetFilters = DatasheetVisibilityFilters;

export interface DatasheetRoleTab {
  role: string | null;
  label: string;
  count: number;
}

export interface UseDatasheetBrowserResult<T extends DatasheetListItem> {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  activeRole: string | null;
  setActiveRole: (role: string | null) => void;
  tabs: DatasheetRoleTab[];
  filteredDatasheets: T[];
  hasResults: boolean;
  totalCount: number;
  clearFilters: () => void;
}

const ALL_ROLE: DatasheetRoleTab = {
  role: null,
  label: 'All',
  count: 0
};

const normalizeQuery = (value: string) => value.trim().toLowerCase();

export const useDatasheetBrowser = <T extends DatasheetListItem>(
  datasheets: T[],
  filters?: DatasheetFilters,
  debounceMs = 300,
  initialRole: string | null = null
): UseDatasheetBrowserResult<T> => {
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(initialRole);

  const debouncedQuery = useDebounce(query, debounceMs);
  const normalizedQuery = normalizeQuery(debouncedQuery);

  const filteredBySettings = useMemo(
    () => filterDatasheetsBySettings(datasheets, filters),
    [datasheets, filters]
  );

  const { roleTabs, totalCount } = useMemo(() => {
    const grouped = groupDatasheetsByRole(filteredBySettings);
    const roles = Object.keys(grouped).sort();

    const tabs: DatasheetRoleTab[] = roles.map((role) => ({
      role,
      label: role,
      count: grouped[role].length
    }));

    const allTab: DatasheetRoleTab = {
      ...ALL_ROLE,
      count: filteredBySettings.length
    };

    return {
      roleTabs: [allTab, ...tabs],
      totalCount: filteredBySettings.length
    };
  }, [filteredBySettings]);

  const filteredDatasheets = useMemo(() => {
    let result = filteredBySettings;

    if (normalizedQuery) {
      result = result.filter((sheet) => sheet.name.toLowerCase().includes(normalizedQuery));
    }

    if (activeRole) {
      result = result.filter((sheet) => sheet.role === activeRole);
    }

    return sortByName(result);
  }, [filteredBySettings, normalizedQuery, activeRole]);

  const hasResults = filteredDatasheets.length > 0;

  const clearFilters = () => {
    setQuery('');
    setActiveRole(initialRole);
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    activeRole,
    setActiveRole,
    tabs: roleTabs,
    filteredDatasheets,
    hasResults,
    totalCount,
    clearFilters
  };
};
