import React, { useMemo, useState } from 'react';
import { Grid, SelectField } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

// components
import DataCard from '../../components/card/data-card';
import Filters from '../../components/filters';
import Search from '../../components/search';
import WargearProfileTable from '../../components/wargear-profile/table';

// hooks
import useDebounce from '../../hooks/use-debounce';
import useSelect from '../../hooks/use-select';

// utils
import { sortByName } from '../../utils/array';

interface Props {
  relics: depot.Relic[];
}

const FactionRelics: React.FC<Props> = ({ relics }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);
  const relicTypes = useMemo(
    () =>
      relics
        .map((r) => r.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [relics]
  );
  const { description: type, value, onChange, options } = useSelect(relicTypes);

  const filteredRelics = useMemo(() => {
    if (type || debouncedQuery) {
      const filteredByType = relics.filter((r) => (type ? r.type === type : true));
      const filteredByName = filteredByType.filter((r) =>
        debouncedQuery ? r.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
      );
      return sortByName(filteredByName) as depot.Relic[];
    }

    return sortByName(relics) as depot.Relic[];
  }, [relics, debouncedQuery, type]);

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
        {filteredRelics.map((relic, i) => (
          <DataCard key={`relic-${i}`} data={relic}>
            {relic.profiles.length ? <WargearProfileTable profiles={relic.profiles} /> : undefined}
          </DataCard>
        ))}
      </Grid>
    </>
  );
};

export default FactionRelics;
