import React from 'react';
import classnames from 'classnames';

import styles from './loader.module.scss';

interface Props {
  white?: boolean;
}

const Loader: React.FC<Props> = ({ white }) => (
  <div className={classnames(styles.loader, white && styles.white)}>
    <div />
    <div />
    <div />
  </div>
);

export default Loader;
