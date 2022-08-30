import React from 'react';
import classnames from 'classnames';

import styles from './alert.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  tile?: boolean;
}

const Alert: React.FC<Props> = ({ children, type = 'info', title, tile, className }) => (
  <article className={classnames(styles.alert, styles[type], tile && styles.tile, className)}>
    {title && <p className={styles.title}>{title}</p>}
    {children}
  </article>
);

export default Alert;