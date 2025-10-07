import { useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import { groupDatasheetsByRole } from '@/utils/datasheet';
import { sortByName } from '@/utils/array';
import useDebounce from './use-debounce';

export interface DatasheetFilters {
  showLegends?: boolean;
  showForgeWorld?: boolean;
}

export interface DatasheetRoleTab {
  role: string | null;
  label: string;
  count: number;
}

export interface UseDatasheetBrowserResult {
  query: string;
  setQuery: (value: string) => void;
  debouncedQuery: string;
  activeRole: string | null;
  setActiveRole: (role: string | null) => void;
  tabs: DatasheetRoleTab[];
  filteredDatasheets: depot.Datasheet[];
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

export const useDatasheetBrowser = (
  datasheets: depot.Datasheet[],
  filters?: DatasheetFilters,
  debounceMs = 300,
  initialRole: string | null = null
): UseDatasheetBrowserResult => {
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(initialRole);

  const debouncedQuery = useDebounce(query, debounceMs);
  const normalizedQuery = normalizeQuery(debouncedQuery);

  const filteredBySettings = useMemo(() => {
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
  }, [datasheets, filters]);

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
