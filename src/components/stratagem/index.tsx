import React from 'react';

import styles from './stratagem.module.scss';

interface Props {
  stratagem: Wahapedia.Stratagem;
}

const Stratagem: React.FC<Props> = ({ stratagem }) => (
  <div className={styles.stratagem}>
    <div className={styles.heading}>
      <span>{stratagem.name}</span>
      <span className={styles.cost}>{stratagem.cp_cost}CP</span>
    </div>
    <p className={styles.legend}>{stratagem.legend}</p>
    <p>{stratagem.description}</p>
  </div>
);

export default Stratagem;
