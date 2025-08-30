import { Table } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

import styles from './datasheet-profile.module.scss';

interface Props {
  profiles: depot.Model[];
}

const headings = [
  { text: 'Name', className: styles.noWrap },
  { text: 'M', className: styles.center },
  { text: 'T', className: styles.center },
  { text: 'Sv', className: styles.center },
  { text: 'W', className: styles.center },
  { text: 'Ld', className: styles.center },
  { text: 'OC', className: styles.center }
];

const DatasheetProfileTable = ({ profiles }: Props) => (
  <Table headings={headings}>
    {profiles.map((entry) => (
      <tr key={entry.line}>
        <td className={styles.noWrap}>{entry.name}</td>
        <td className={styles.center}>{entry.m}</td>
        <td className={styles.center}>{entry.t}</td>
        <td className={styles.center}>{entry.sv}</td>
        <td className={styles.center}>{entry.w}</td>
        <td className={styles.center}>{entry.ld}</td>
        <td className={styles.center}>{entry.oc}</td>
      </tr>
    ))}
  </Table>
);

export default DatasheetProfileTable;
