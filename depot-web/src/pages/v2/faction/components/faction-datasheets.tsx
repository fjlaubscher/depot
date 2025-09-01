import React, { useMemo, useState } from 'react';
import { depot } from 'depot-core';

// UI Components
import Grid from '@/components/ui/grid';
import SelectField from '@/components/ui/select-field';
import Search from '@/components/ui/search';
import Filters from '@/components/ui/filters';
import LinkCard from '@/components/ui/link-card';

// Hooks
import useDebounce from '@/hooks/use-debounce';
import useSelect from '@/hooks/use-select';
import useLocalStorage from '@/hooks/use-local-storage';

// Utils
import { groupDatasheetsByRole } from '@/utils/datasheet';

interface FactionDatasheetsProps {
  datasheets: depot.Datasheet[];
}

const FactionDatasheets: React.FC<FactionDatasheetsProps> = ({ datasheets }) => {
  const [settings] = useLocalStorage<depot.Settings>('settings');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  // Generate role options from actual datasheets
  const roleOptions = useMemo(() => {
    const roles = [...new Set(datasheets.map((ds) => ds.role))].sort();
    return roles.map((role) => role.toUpperCase());
  }, [datasheets]);

  const { value, description: role, onChange, options } = useSelect(roleOptions);

  const groupedDatasheets = useMemo(() => {
    let filteredDatasheets = settings?.showLegends
      ? datasheets
      : datasheets.filter((ds) => ds.isLegends === false);

    filteredDatasheets = settings?.showForgeWorld
      ? filteredDatasheets
      : filteredDatasheets.filter((ds) => ds.isForgeWorld === false);

    filteredDatasheets =
      role && value !== 0
        ? filteredDatasheets.filter((ds) => ds.role.toUpperCase() === role)
        : filteredDatasheets;

    filteredDatasheets = debouncedQuery
      ? filteredDatasheets.filter((ds) =>
          ds.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      : filteredDatasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, debouncedQuery, role, value, settings]);

  return (
    <div className="space-y-6" data-testid="faction-datasheets">
      <Filters
        showClear={value !== 0 || !!query}
        onClear={() => {
          setQuery('');
          onChange(0);
        }}
      >
        <Search label="Search by name" value={query} onChange={setQuery} />
        <SelectField
          name="role"
          value={value}
          label="Filter by role"
          onChange={(e) => onChange(Number(e.target.value))}
          options={options}
        />
      </Filters>

      {Object.keys(groupedDatasheets).map((key) =>
        groupedDatasheets[key].length ? (
          <div key={key} className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">
                {key}
              </h2>
            </div>
            <Grid>
              {groupedDatasheets[key].map((ds) => (
                <LinkCard key={ds.id} to={`/faction/${ds.factionId}/datasheet/${ds.id}`}>
                  {ds.name}
                </LinkCard>
              ))}
            </Grid>
          </div>
        ) : null
      )}

      {Object.keys(groupedDatasheets).every((key) => groupedDatasheets[key].length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No datasheets found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default FactionDatasheets;
