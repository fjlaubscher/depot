import React from 'react';

import styles from './card.module.scss';

interface Props {
  data: Required<{ name: string; type: string; legend: string; description: string }>;
}

const DataCard: React.FC<Props> = ({ data }) => (
  <div className={styles.data}>
    <div className={styles.heading}>
      <span>{data.name}</span>
    </div>
    <p className={styles.type}>{data.type}</p>
    <p className={styles.legend}>{data.legend}</p>
    <p>{data.description}</p>
  </div>
);

export default DataCard;
