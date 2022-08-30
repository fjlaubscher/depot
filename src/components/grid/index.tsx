import React from 'react';
import classNames from 'classnames';

import styles from './grid.module.scss';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

const Grid: React.FC<Props> = ({ className, children }) => (
  <div className={classNames(styles.grid, className)}>{children}</div>
);

export default Grid;
