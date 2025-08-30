// components
import { Table } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

import styles from './wargear-profile.module.scss';

interface Props {
  profiles: depot.Wargear[];
  type: 'Melee' | 'Ranged';
}

const getHeadings = (isRanged: boolean) =>
  [
    { text: isRanged ? 'Ranged Wargear' : 'Melee Wargear', className: styles.noWrap },
    isRanged ? { text: 'Range', className: styles.center } : null,
    { text: 'A', className: styles.center },
    { text: isRanged ? 'BS' : 'WS', className: styles.center },
    { text: 'S', className: styles.center },
    { text: 'AP', className: styles.center },
    { text: 'D', className: styles.center }
  ].filter((i) => i !== null);

const formatBsWs = (value: string) => (value === 'N/A' ? value : `${value}+`);

const WargearProfileTable = ({ profiles, type }: Props) => (
  <Table headings={getHeadings(type === 'Ranged')}>
    {profiles.map((entry) => (
      <tr key={`wargear-${entry.line}`}>
        <td className={styles.noWrap}>
          {entry.name}
          {entry.description ? (
            <span className={styles.keywords}>[{entry.description.toLowerCase()}]</span>
          ) : null}
        </td>
        {type === 'Ranged' ? <td className={styles.center}>{entry.range}"</td> : null}
        <td className={styles.center}>{entry.a}</td>
        <td className={styles.center}>{formatBsWs(entry.bsWs)}</td>
        <td className={styles.center}>{entry.s}</td>
        <td className={styles.center}>{entry.ap}</td>
        <td className={styles.center}>{entry.d}</td>
      </tr>
    ))}
  </Table>
);

export default WargearProfileTable;
