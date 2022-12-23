import { ReactNode } from 'react';
import { Card } from '@fjlaubscher/matter';

import styles from './card.module.scss';

interface Props {
  children?: ReactNode;
  data: Required<{ name: string; type: string; legend: string; description: string }>;
}

const DataCard = ({ children, data }: Props) => (
  <Card className={styles.data}>
    <div className={styles.heading}>
      <span>{data.name.toLowerCase()}</span>
    </div>
    <p className={styles.type}>{data.type}</p>
    <p className={styles.legend}>{data.legend}</p>
    <p>{data.description}</p>
    {children && <div className={styles.content}>{children}</div>}
  </Card>
);

export default DataCard;
