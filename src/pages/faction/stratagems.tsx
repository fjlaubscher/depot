import React, { useMemo, useState } from 'react';

// components
import Filters from '../../components/filters';
import Grid from '../../components/grid';
import Search from '../../components/search';
import Stratagem from '../../components/stratagem';

// hooks
import useDebounce from '../../hooks/use-debounce';

interface Props {
  stratagems: Wahapedia.Stratagem[];
}

const FactionStratagems: React.FC<Props> = ({ stratagems }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const groupedStratagems = useMemo(() => {
    const filteredStratagems = debouncedQuery
      ? stratagems.filter((ds) => ds.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
      : stratagems;

    return filteredStratagems;
  }, [stratagems, debouncedQuery]);

  return (
    <>
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search value={query} onChange={setQuery} />
      </Filters>
      <Grid>
        {groupedStratagems.map((stratagem) => (
          <Stratagem key={stratagem.id} stratagem={stratagem} />
        ))}
      </Grid>
    </>
  );
};

export default FactionStratagems;
