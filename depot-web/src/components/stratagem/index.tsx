import React from 'react';
import { Card } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

import styles from './stratagem.module.scss';

interface Props {
  stratagem: depot.Stratagem;
}

const Stratagem: React.FC<Props> = ({ stratagem }) => (
  <Card className={styles.stratagem}>
    <div className={styles.heading}>
      <span>{stratagem.name.toLowerCase()}</span>
      <span className={styles.cost}>{stratagem.cpCost}CP</span>
    </div>
    <p className={styles.type}>{stratagem.type}</p>
    <p className={styles.legend}>{stratagem.legend}</p>
    <p>{stratagem.description}</p>
  </Card>
);

export default Stratagem;
