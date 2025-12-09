import { useMemo, useState } from 'react';
import type { DatasheetListItem } from '@/types/datasheets';
import {
  type DatasheetVisibilityFilters,
  filterDatasheetsBySettings,
  groupDatasheetsByRole
} from '@depot/core/utils/datasheets';
import { sortByName } from '@depot/core/utils/common';
import useDebounce from './use-debounce';
import usePersistedTagSelection from './use-persisted-tag-selection';

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
  const roleKey = 'datasheet-role-filter';
  const sentinelAll = initialRole ?? 'all';
  const {
    selection: persistedRole,
    setSelection: setPersistedRole,
    clearSelection: clearPersistedRole
  } = usePersistedTagSelection<string>(roleKey, sentinelAll, () => true);

  const [activeRole, setActiveRoleState] = useState<string | null>(
    persistedRole === 'all' ? null : persistedRole
  );

  const setActiveRole = (role: string | null) => {
    const next = role ?? 'all';
    setActiveRoleState(role);
    if (next === 'all') {
      clearPersistedRole();
    } else {
      setPersistedRole(next);
    }
  };

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
