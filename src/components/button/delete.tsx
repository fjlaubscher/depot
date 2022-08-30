import React from 'react';
import { FiTrash } from 'react-icons/fi';

// components
import Button from '.';

import styles from './button.module.scss';

interface Props {
  onClick: () => void;
  busy?: boolean;
}

const DeleteButton: React.FC<Props> = ({ busy, onClick }) => {
  return (
    <Button className={styles.delete} loading={busy} icon onClick={onClick}>
      Delete
      <FiTrash />
    </Button>
  );
};

export default DeleteButton;