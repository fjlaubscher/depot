import React from 'react';

import styles from './table.module.scss';

interface Props {
  headings: { text: string; className?: string }[];
  children: React.ReactNode;
}

const Table: React.FC<Props> = ({ children, headings }) => (
  <div className={styles.container}>
    <table className={styles.table}>
      <thead>
        <tr>
          {headings.map((heading, i) => (
            <th className={heading.className} key={`table-heading-${i}`}>
              {heading.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default Table;
