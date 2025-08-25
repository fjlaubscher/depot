import { Table } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

import styles from './datasheet-profile.module.scss';

interface Props {
  profiles: depot.Model[];
  showCost: boolean;
}

const headings = [
  { text: '#', className: styles.noWrap },
  { text: 'Name', className: styles.noWrap },
  { text: 'M', className: styles.center },
  { text: 'WS', className: styles.center },
  { text: 'BS', className: styles.center },
  { text: 'S', className: styles.center },
  { text: 'T', className: styles.center },
  { text: 'W', className: styles.center },
  { text: 'A', className: styles.center },
  { text: 'Ld', className: styles.center },
  { text: 'Sv', className: styles.center }
];

const DatasheetProfileTable = ({ profiles, showCost }: Props) => (
  <Table headings={showCost ? [...headings, { text: 'Cost', className: styles.center }] : headings}>
    {profiles.map((entry) => (
      <tr key={entry.line}>
        <td className={styles.noWrap}>{entry.modelsPerUnit}</td>
        <td className={styles.noWrap}>{entry.name}</td>
        <td className={styles.center}>{entry.m}</td>
        <td className={styles.center}>{entry.ws}</td>
        <td className={styles.center}>{entry.bs}</td>
        <td className={styles.center}>{entry.s}</td>
        <td className={styles.center}>{entry.t}</td>
        <td className={styles.center}>{entry.w}</td>
        <td className={styles.center}>{entry.a}</td>
        <td className={styles.center}>{entry.ld}</td>
        <td className={styles.center}>{entry.sv}</td>
        {showCost && <td className={styles.center}>{entry.cost || '-'}</td>}
      </tr>
    ))}
  </Table>
);

export default DatasheetProfileTable;
