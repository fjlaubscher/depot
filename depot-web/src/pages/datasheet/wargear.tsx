import React, { useMemo, useState } from 'react';

// components
import Filters from '../../components/filters';
import Search from '../../components/search';
import WargearProfileTable from '../../components/wargear-profile/table';

// hooks
import useDebounce from '../../hooks/use-debounce';

// utils
import { sortByName, sortByType } from '../../utils/array';

interface Props {
  wargear: depot.Wargear[];
}

const DatasheetWargear: React.FC<Props> = ({ wargear }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  const filteredWargear = useMemo(() => {
    if (debouncedQuery) {
      const filteredByName = wargear.filter((w) =>
        w.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      return sortByName(filteredByName) as depot.Wargear[];
    }

    return sortByName(wargear) as depot.Wargear[];
  }, [wargear, debouncedQuery]);

  const profiles = useMemo(() => {
    return filteredWargear.reduce((acc, w) => {
      const profiles =
        w.profiles.length > 1
          ? w.profiles.map((p) => ({ ...p, name: `${w.name} - ${p.name}` } as depot.WargearProfile))
          : w.profiles;

      return [...acc, ...profiles];
    }, [] as depot.WargearProfile[]);
  }, [filteredWargear]);

  return (
    <>
      <Filters showClear={!!query} onClear={() => setQuery('')}>
        <Search value={query} onChange={setQuery} />
      </Filters>
      <WargearProfileTable profiles={profiles} />
    </>
  );
};

export default DatasheetWargear;
