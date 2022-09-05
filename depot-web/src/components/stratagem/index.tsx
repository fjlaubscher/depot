import React from 'react';

import styles from './stratagem.module.scss';

interface Props {
  stratagem: depot.Stratagem;
}

const Stratagem: React.FC<Props> = ({ stratagem }) => (
  <div className={styles.stratagem}>
    <div className={styles.heading}>
      <span>{stratagem.name}</span>
      <span className={styles.cost}>{stratagem.cpCost}CP</span>
    </div>
    <p className={styles.type}>{stratagem.type}</p>
    <p className={styles.legend}>{stratagem.legend}</p>
    <p>{stratagem.description}</p>
  </div>
);

export default Stratagem;
