import React, { useMemo, useState } from 'react';

// components
import Filters from '../../components/filters';
import Grid from '../../components/grid';
import LinkCard from '../../components/card/link';
import Search from '../../components/search';

// hooks
import useDebounce from '../../hooks/use-debounce';

// utils
import { groupDatasheetsByRole, ROLES } from '../../utils/datasheet';
import slugify from '../../utils/slugify';

import styles from './faction.module.scss';

interface Props {
  datasheets: depot.Datasheet[];
}

const FactionDatasheets: React.FC<Props> = ({ datasheets }) => {
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 100);

  const groupedDatasheets = useMemo(() => {
    const filteredDatasheets =
      role || debouncedQuery
        ? datasheets.filter((ds) =>
            role
              ? ds.role === role
              : true && debouncedQuery
              ? ds.name.toLowerCase().includes(debouncedQuery.toLowerCase())
              : true
          )
        : datasheets;

    return groupDatasheetsByRole(filteredDatasheets);
  }, [datasheets, debouncedQuery, role]);

  return (
    <>
      <Filters
        showClear={!!role || !!query}
        onClear={() => {
          setQuery('');
          setRole('');
        }}
      >
        <Search value={query} onChange={setQuery} />
        <select
          placeholder="Select an option"
          name="role"
          value={role}
          onChange={(e) => setRole(e.currentTarget.value)}
        >
          <option>All</option>
          {ROLES.map((role, i) => (
            <option key={`role-${i}`} value={role}>
              {role}
            </option>
          ))}
        </select>
      </Filters>
      {Object.keys(groupedDatasheets).map((key) =>
        groupedDatasheets[key].length ? (
          <div className={styles.datasheets} key={key}>
            <div className={styles.role}>
              <img src={`/role/${slugify(key)}.png`} alt={role} />
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
