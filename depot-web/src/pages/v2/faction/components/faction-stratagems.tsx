import React, { useMemo, useState } from 'react';
import { depot } from 'depot-core';

// UI Components
import Grid from '@/components/ui/grid';
import SelectField from '@/components/ui/select-field';
import Search from '@/components/ui/search';
import Filters from '@/components/ui/filters';
import StratagemCard from './stratagem-card';

// Hooks
import useDebounce from '@/hooks/use-debounce';
import useSelect from '@/hooks/use-select';

// Utils
import { sortByName } from '@/utils/array';

interface FactionStratagemProps {
  stratagems: depot.Stratagem[];
}

const FactionStratagems: React.FC<FactionStratagemProps> = ({ stratagems }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const stratagemTypes = useMemo(
    () =>
      stratagems
        .map((s) => s.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [stratagems]
  );

  const { description: type, value, onChange, options } = useSelect(stratagemTypes);

  const filteredStratagems = useMemo(() => {
    // Only apply type filter if not "All" (value !== 0)
    const typeFilter = value !== 0 ? type : undefined;
    
    if (typeFilter || debouncedQuery) {
      const filteredByType = stratagems.filter((s) => (typeFilter ? s.type === typeFilter : true));
      const filteredByName = filteredByType.filter((s) =>
        debouncedQuery ? s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
      );
      return sortByName(filteredByName) as depot.Stratagem[];
    }

    return sortByName(stratagems) as depot.Stratagem[];
  }, [stratagems, debouncedQuery, type, value]);

  return (
    <div className="space-y-6">
      <Filters
        showClear={value !== 0 || !!query}
        onClear={() => {
          setQuery('');
          onChange(0);
        }}
      >
        <Search label="Search by name" value={query} onChange={setQuery} />
        <SelectField
          name="type"
          value={value}
          label="Filter by type"
          onChange={onChange}
          options={options}
        />
      </Filters>

      <Grid>
        {filteredStratagems.map((stratagem) => (
          <StratagemCard key={stratagem.id} stratagem={stratagem} />
        ))}
      </Grid>

      {filteredStratagems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No stratagems found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default FactionStratagems;
