import React from 'react';

import styles from './table.module.scss';

interface Props {
  headings: string[];
  children: React.ReactNode;
}

const Table: React.FC<Props> = ({ children, headings }) => (
  <table className={styles.table}>
    <thead>
      <tr>
        {headings.map((heading, i) => (
          <th key={`table-heading-${i}`}>{heading}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export default Table;
