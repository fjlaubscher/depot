import { useMemo, useState } from 'react';
import { Grid, SelectField } from '@fjlaubscher/matter';
import useLocalStorage from '@/hooks/use-local-storage';
import { depot } from 'depot-core';

// components
import Filters from '../../components/filters';
import LinkCard from '../../components/card/link';
import Search from '../../components/search';

// hooks
import useDebounce from '../../hooks/use-debounce';
import useSelect from '../../hooks/use-select';

// utils
import { groupDatasheetsByRole, ROLES } from '../../utils/datasheet';

import styles from './faction.module.scss';

interface Props {
  datasheets: depot.Datasheet[];
}

const FactionDatasheets = ({ datasheets }: Props) => {
  const [settings] = useLocalStorage<depot.Settings>('settings');

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);
  const { value, description: role, onChange, options } = useSelect(ROLES);

  const groupedDatasheets = useMemo(() => {
    let filteredDatasheets = settings?.showLegends
      ? datasheets
      : datasheets.filter((ds) => ds.isLegends === false);

    filteredDatasheets = settings?.showForgeWorld
      ? filteredDatasheets
      : filteredDatasheets.filter((ds) => ds.isForgeWorld === false);

    filteredDatasheets = role
      ? filteredDatasheets.filter((ds) => ds.role === role)
      : filteredDatasheets;

    filteredDatasheets = debouncedQuery
      ? filteredDatasheets.filter((ds) =>
          ds.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      : filteredDatasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, debouncedQuery, role, settings]);

  return (
    <>
      <Filters
        showClear={!!role || !!query}
        onClear={() => {
          setQuery('');
          onChange(0);
        }}
      >
        <Search label="Search by name" value={query} onChange={setQuery} />
        <SelectField
          name="role"
          value={value}
          label="Filter by role"
          onChange={onChange}
          options={options}
        />
      </Filters>
      {Object.keys(groupedDatasheets).map((key) =>
        groupedDatasheets[key].length ? (
          <div className={styles.datasheets} key={key}>
            <div className={styles.role}>
              <h2>{key}</h2>
            </div>
            <Grid>
              {groupedDatasheets[key].map((ds) => (
                <LinkCard key={ds.id} to={`/faction/${ds.factionId}/datasheet/${ds.id}`}>
                  {ds.name}
                </LinkCard>
              ))}
            </Grid>
          </div>
        ) : undefined
      )}
    </>
  );
};

export default FactionDatasheets;
