import React, { useMemo, useState } from 'react';
import { Grid, SelectField } from '@fjlaubscher/matter';

// components
import Filters from '../../components/filters';
import Search from '../../components/search';
import Stratagem from '../../components/stratagem';

// hooks
import useDebounce from '../../hooks/use-debounce';
import useSelect from '../../hooks/use-select';

// utils
import { sortByName } from '../../utils/array';

interface Props {
  stratagems: depot.Stratagem[];
}

const DatasheetStratagems = ({ stratagems }: Props) => {
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
    if (type || debouncedQuery) {
      const filteredByType = stratagems.filter((s) => (type ? s.type === type : true));
      const filteredByName = filteredByType.filter((s) =>
        debouncedQuery ? s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
      );
      return sortByName(filteredByName) as depot.Stratagem[];
    }

    return sortByName(stratagems) as depot.Stratagem[];
  }, [stratagems, debouncedQuery, type]);

  return (
    <>
      <Filters
        showClear={!!type || !!query}
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
          <Stratagem key={stratagem.id} stratagem={stratagem} />
        ))}
      </Grid>
    </>
  );
};

export default DatasheetStratagems;
