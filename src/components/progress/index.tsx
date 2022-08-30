import React from 'react';
import classNames from 'classnames';

import styles from './progress.module.scss';

interface Props {
  className?: string;
}

const Progress: React.FC<Props> = ({ className }) => (
  <div className={classNames(styles.progress, className)}>
    <div className={styles.value} />
  </div>
);

export default Progress;
