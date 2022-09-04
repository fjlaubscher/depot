import React from 'react';
import classnames from 'classnames';

// components
import Loader from '../loader';

import styles from './button.module.scss';

interface Props {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  primary?: boolean;
  type?: 'button' | 'submit';
  icon?: boolean;
  onClick?: () => void;
}

const Button: React.FC<Props> = ({
  children,
  className,
  disabled = false,
  loading = false,
  primary = false,
  type = 'button',
  icon = false,
  onClick
}) => (
  <button
    disabled={disabled}
    className={classnames(
      styles.button,
      primary && styles.primary,
      icon && styles.icon,
      loading && styles.loading,
      className
    )}
    type={type}
    onClick={onClick}
  >
    {loading ? <Loader white /> : children}
  </button>
);

export default Button;
