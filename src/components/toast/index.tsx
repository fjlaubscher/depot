import React from 'react';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import { FiX } from 'react-icons/fi';

import styles from './toast.module.scss';

interface Props {
  children: React.ReactNode;
  visible: boolean;
  type?: 'info' | 'warning' | 'error';
  onCloseClick?: () => void;
}

const Toast: React.FC<Props> = ({ children, visible, type = 'info', onCloseClick }) => {
  const toastPortal = document.getElementById('toast') as HTMLElement;

  return createPortal(
    <div className={classnames(styles.toast, visible && styles.visible, styles[type])}>
      <div className={styles.heading}>
        {type}
        {onCloseClick && (
          <button type="button" className={styles.close} onClick={onCloseClick}>
            <FiX />
          </button>
        )}
      </div>
      {children}
    </div>,
    toastPortal
  );
};

export default Toast;