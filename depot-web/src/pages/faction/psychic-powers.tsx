import React, { useMemo, useState } from 'react';

// components
import DataCard from '../../components/card/data-card';
import Filters from '../../components/filters';
import Grid from '../../components/grid';
import Search from '../../components/search';

// hooks
import useDebounce from '../../hooks/use-debounce';

// utils
import { sortByName } from '../../utils/array';

interface Props {
  psychicPowers: depot.PsychicPower[];
}

const FactionPsychicPowers: React.FC<Props> = ({ psychicPowers }) => {
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

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

  const psychicPowerTypes = useMemo(
    () =>
      psychicPowers
        .map((p) => p.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [psychicPowers]
  );

  return (
    <>
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search value={query} onChange={setQuery} />
        <select
          placeholder="Select an option"
          name="type"
          value={type}
          onChange={(e) => setType(e.currentTarget.value)}
        >
          <option value="">All</option>
          {psychicPowerTypes.map((type, i) => (
            <option key={`type-${i}`} value={type}>
              {type}
            </option>
          ))}
        </select>
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
