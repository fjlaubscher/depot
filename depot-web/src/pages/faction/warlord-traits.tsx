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
  warlordTraits: depot.WarlordTrait[];
}

const FactionWarlordTraits: React.FC<Props> = ({ warlordTraits }) => {
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

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

  const warlordTraitTypes = useMemo(
    () =>
      warlordTraits
        .map((wlt) => wlt.type)
        .filter((type, index, self) => self.indexOf(type) === index)
        .sort(),
    [warlordTraits]
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
          {warlordTraitTypes.map((type, i) => (
            <option key={`type-${i}`} value={type}>
              {type}
            </option>
          ))}
        </select>
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
