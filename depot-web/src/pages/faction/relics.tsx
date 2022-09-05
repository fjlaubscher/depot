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
  relics: depot.Relic[];
}

const FactionRelics: React.FC<Props> = ({ relics }) => {
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

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

  const relicTypes = useMemo(
    () =>
      relics
        .map((r) => r.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [relics]
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
          {relicTypes.map((type, i) => (
            <option key={`type-${i}`} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Filters>
      <Grid>
        {filteredRelics.map((relic, i) => (
          <DataCard key={`relic-${i}`} data={relic} />
        ))}
      </Grid>
    </>
  );
};

export default FactionRelics;
