import React from 'react';
import classnames from 'classnames';

import styles from './icon-button.module.scss';

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}

const IconButton: React.FC<Props> = ({ children, className, onClick }) => (
  <button className={classnames(styles.button, className)} onClick={onClick}>
    {children}
  </button>
);

export default IconButton;
