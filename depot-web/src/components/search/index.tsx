import React from 'react';
import { Field } from '@fjlaubscher/matter';

import styles from './search.module.scss';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
}

const Search: React.FC<Props> = ({ label, value, placeholder, onChange }) => (
  <Field className={styles.container}>
    {label && <label htmlFor="search">{label}</label>}
    <input
      className={styles.search}
      id="search"
      name="search"
      placeholder={placeholder || 'Search'}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  </Field>
);

export default Search;
