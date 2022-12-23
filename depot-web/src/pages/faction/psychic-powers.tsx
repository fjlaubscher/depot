import React, { useMemo, useState } from 'react';
import { Grid, SelectField } from '@fjlaubscher/matter';

// components
import DataCard from '../../components/card/data-card';
import Filters from '../../components/filters';
import Search from '../../components/search';

// hooks
import useDebounce from '../../hooks/use-debounce';
import useSelect from '../../hooks/use-select';

// utils
import { sortByName } from '../../utils/array';

interface Props {
  psychicPowers: depot.PsychicPower[];
}

const FactionPsychicPowers: React.FC<Props> = ({ psychicPowers }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const psychicPowerTypes = useMemo(
    () =>
      psychicPowers
        .map((p) => p.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [psychicPowers]
  );
  const { description: type, value, onChange, options } = useSelect(psychicPowerTypes);

  const filteredPsychicPowers = useMemo(() => {
    if (type || debouncedQuery) {
      const filteredByType = psychicPowers.filter((p) => (type ? p.type === type : true));
      const filteredByName = filteredByType.filter((p) =>
        debouncedQuery ? p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
      );
      return sortByName(filteredByName) as depot.PsychicPower[];
    }

    return sortByName(psychicPowers) as depot.PsychicPower[];
  }, [psychicPowers, debouncedQuery, type]);

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
        {filteredPsychicPowers.map((p, i) => (
          <DataCard key={`psychic-power-${i}`} data={p} />
        ))}
      </Grid>
    </>
  );
};

export default FactionPsychicPowers;
