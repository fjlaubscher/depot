import React from 'react';

import styles from './search.module.scss';

interface Props {
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
}

const Search: React.FC<Props> = ({ value, placeholder, onChange }) => (
  <div className={styles.container}>
    <input
      className={styles.search}
      name="search"
      placeholder={placeholder || 'Search'}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  </div>
);

export default Search;
