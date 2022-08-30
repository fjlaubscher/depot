import React from 'react';

import styles from './filters.module.scss';

interface Props {
  children: React.ReactNode;
  showClear: boolean;
  onClear: () => void;
}

const Filters: React.FC<Props> = ({ children, showClear, onClear }) => (
  <div className={styles.filters}>
    <div className={styles.controls}>{children}</div>
    {showClear ? <a onClick={onClear}>Clear</a> : undefined}
  </div>
);

export default Filters;
