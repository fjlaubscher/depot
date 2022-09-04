import React from 'react';
import classnames from 'classnames';
import { FiSlash } from 'react-icons/fi';

// components
import Button from '../button';
import DeleteButton from '../button/delete';

import styles from './delete-modal.module.scss';

interface Props {
  show: boolean;
  children: React.ReactNode;
  busy: boolean;
  onConfirmClick: () => void;
  onCloseClick: () => void;
}

const DeleteModal: React.FC<Props> = ({ show, busy, children, onConfirmClick, onCloseClick }) => (
  <div className={classnames(styles.modal, show && styles.show)}>
    <div className={styles.content}>
      {children}
      <div className={styles.buttons}>
        <DeleteButton busy={busy} onClick={onConfirmClick} />
        <Button className={styles.cancel} type="button" onClick={onCloseClick} icon>
          Cancel
          <FiSlash />
        </Button>
      </div>
    </div>
  </div>
);

export default DeleteModal;
