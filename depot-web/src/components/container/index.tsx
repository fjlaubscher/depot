import React from 'react';
import classnames from 'classnames';

import styles from './container.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

const Container: React.FC<Props> = ({ className, children }) => (
  <div className={classnames(styles.container, className)}>{children}</div>
);

export default Container;
