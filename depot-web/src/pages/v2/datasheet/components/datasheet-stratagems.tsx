import React, { useMemo, useState } from 'react';
import { depot } from 'depot-core';

// components
import Grid from '@/components/ui/grid';
import Filters from '@/components/ui/filters';
import Search from '@/components/ui/search';
import SelectField from '@/components/ui/select-field';
import StratagemCard from '@/components/shared/stratagem-card';

// hooks
import useDebounce from '@/hooks/use-debounce';

// utils
import { sortByName } from '@/utils/array';

interface DatasheetStratagemsProps {
  stratagems: depot.Stratagem[];
}

const DatasheetStratagems: React.FC<DatasheetStratagemsProps> = ({ stratagems }) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  const stratagemTypes = useMemo(() => {
    const types = stratagems
      .map((s) => s.type)
      .filter((type, index, self) => self.indexOf(type) === index)
      .sort();
    return types;
  }, [stratagems]);

  const typeOptions = useMemo(() => {
    return [
      { value: '', label: 'All Types' },
      ...stratagemTypes.map((type) => ({ value: type, label: type }))
    ];
  }, [stratagemTypes]);

  const filteredStratagems = useMemo(() => {
    let filtered = stratagems;

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter((s) => s.type === selectedType);
    }

    // Filter by search query
    if (debouncedQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    return sortByName(filtered) as depot.Stratagem[];
  }, [stratagems, selectedType, debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setSelectedType('');
  };

  const showClearButton = !!selectedType || !!query;

  if (stratagems.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-stratagems">
        <p className="text-gray-500 dark:text-gray-400">
          No stratagems associated with this datasheet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="datasheet-stratagems">
      <Filters showClear={showClearButton} onClear={handleClear}>
        <Search
          label="Search by name"
          value={query}
          onChange={setQuery}
          placeholder="Search stratagems..."
        />
        <SelectField
          name="type"
          label="Filter by type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={typeOptions}
        />
      </Filters>

      {filteredStratagems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No stratagems found matching your search criteria.
          </p>
        </div>
      ) : (
        <Grid>
          {filteredStratagems.map((stratagem) => (
            <StratagemCard key={stratagem.id} stratagem={stratagem} />
          ))}
        </Grid>
      )}
    </div>
  );
};

export default DatasheetStratagems;
