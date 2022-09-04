import React from 'react';
import classnames from 'classnames';
import { FiTrash } from 'react-icons/fi';

import styles from './card.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  title?: string;
  onDeleteClick?: () => void;
}

const Card: React.FC<Props> = ({ className, children, title, onDeleteClick }) => (
  <div className={classnames(styles.card, className)}>
    {title ? <p className={styles.title}>{title}</p> : undefined}
    {children}
    {onDeleteClick && (
      <button type="button" className={styles.delete} onClick={onDeleteClick}>
        <FiTrash />
      </button>
    )}
  </div>
);

export default Card;
