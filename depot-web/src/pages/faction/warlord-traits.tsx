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
  warlordTraits: depot.WarlordTrait[];
}

const FactionWarlordTraits: React.FC<Props> = ({ warlordTraits }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const warlordTraitTypes = useMemo(
    () =>
      warlordTraits
        .map((wlt) => wlt.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [warlordTraits]
  );
  const { description: type, value, onChange, options } = useSelect(warlordTraitTypes);

  const filteredWarlordTraits = useMemo(() => {
    if (type || debouncedQuery) {
      const filteredByType = warlordTraits.filter((wlt) => (type ? wlt.type === type : true));
      const filteredByName = filteredByType.filter((wlt) =>
        debouncedQuery ? wlt.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
      );
      return sortByName(filteredByName) as depot.WarlordTrait[];
    }

    return sortByName(warlordTraits) as depot.WarlordTrait[];
  }, [warlordTraits, debouncedQuery, type]);

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
        {filteredWarlordTraits.map((wlt, i) => (
          <DataCard key={`warlord-trait-${i}`} data={wlt} />
        ))}
      </Grid>
    </>
  );
};

export default FactionWarlordTraits;
