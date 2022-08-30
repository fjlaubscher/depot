import React, { useMemo, useState } from 'react';
import Filters from '../../components/filters';

// components
import Grid from '../../components/grid';
import Search from '../../components/search';
import WargearProfile from '../../components/wargear-profile';

// hooks
import useDebounce from '../../hooks/use-debounce';

interface Props {
  wargear: Wahapedia.Wargear[];
}

const DatasheetWargear: React.FC<Props> = ({ wargear }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  const filteredWargear = useMemo(
    () =>
      debouncedQuery
        ? wargear.filter((w) => w.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
        : wargear,
    [wargear, debouncedQuery]
  );

  return (
    <>
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search value={query} onChange={setQuery} />
      </Filters>
      <Grid>
        {filteredWargear.map((w) => (
          <WargearProfile key={w.id} wargear={w} />
        ))}
      </Grid>
    </>
  );
};

export default DatasheetWargear;
