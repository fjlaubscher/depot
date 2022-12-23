// components
import Table from '../table';

import styles from './wargear-profile.module.scss';

interface Props {
  profiles: depot.WargearProfile[];
}

const headings = [
  { text: 'Name', className: styles.noWrap },
  { text: 'Type', className: styles.noWrap },
  { text: 'Range', className: styles.center },
  { text: 'S', className: styles.center },
  { text: 'AP', className: styles.center },
  { text: 'D', className: styles.center },
  { text: 'Abilities', className: styles.noWrap }
];

const WargearProfileTable = ({ profiles }: Props) => (
  <Table headings={headings}>
    {profiles.map((entry) => (
      <tr key={`${entry.wargearId}-${entry.line}`}>
        <td className={styles.noWrap}>{entry.name}</td>
        <td className={styles.noWrap}>{entry.type}</td>
        <td className={styles.center}>{entry.range}</td>
        <td className={styles.center}>{entry.s}</td>
        <td className={styles.center}>{entry.ap}</td>
        <td className={styles.center}>{entry.d}</td>
        <td className={styles.noWrap}>{entry.abilities || '-'}</td>
      </tr>
    ))}
  </Table>
);

export default WargearProfileTable;
