import React, { useMemo, useState } from 'react';
import { Grid, SelectField } from '@fjlaubscher/matter';

// components
import Filters from '../../components/filters';
import LinkCard from '../../components/card/link';
import Search from '../../components/search';

// hooks
import useDebounce from '../../hooks/use-debounce';
import useSelect from '../../hooks/use-select';

// utils
import { groupDatasheetsByRole, ROLES } from '../../utils/datasheet';
import slugify from '../../utils/slugify';

import styles from './faction.module.scss';

interface Props {
  datasheets: depot.Datasheet[];
}

const FactionDatasheets = ({ datasheets }: Props) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);
  const { value, description: role, onChange, options } = useSelect(ROLES);

  const groupedDatasheets = useMemo(() => {
    if (debouncedQuery || role) {
      const filteredByRole = datasheets.filter((ds) => (role ? ds.role === role : true));
      const filteredByName = filteredByRole.filter((ds) =>
        debouncedQuery ? ds.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
      );
      return groupDatasheetsByRole(filteredByName);
    }

    return groupDatasheetsByRole(datasheets);
  }, [datasheets, debouncedQuery, role]);

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
