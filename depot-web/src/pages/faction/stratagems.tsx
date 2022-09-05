import React, { useMemo, useState } from 'react';

// components
import Filters from '../../components/filters';
import Grid from '../../components/grid';
import Search from '../../components/search';
import Stratagem from '../../components/stratagem';

// hooks
import useDebounce from '../../hooks/use-debounce';

// utils
import { sortByName } from '../../utils/array';

interface Props {
  stratagems: depot.Stratagem[];
}

const FactionStratagems: React.FC<Props> = ({ stratagems }) => {
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

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

  const stratagemTypes = useMemo(
    () =>
      stratagems
        .map((s) => s.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [stratagems]
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
          {stratagemTypes.map((type, i) => (
            <option key={`type-${i}`} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Filters>
      <Grid>
        {filteredStratagems.map((stratagem) => (
          <Stratagem key={stratagem.id} stratagem={stratagem} />
        ))}
      </Grid>
    </>
  );
};

export default FactionStratagems;
