import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

import styles from './button.module.scss';

interface Props {
  className?: string;
  to: string;
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const LinkButton: React.FC<Props> = ({
  className,
  to,
  children,
  primary = false,
  onClick,
  leftIcon,
  rightIcon
}) => (
  <Link
    className={classnames(styles.button, styles.link, primary && styles.primary, className)}
    to={to}
    onClick={onClick}
  >
    {leftIcon}
    {children}
    {rightIcon}
  </Link>
);

export default LinkButton;
