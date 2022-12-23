import { ReactNode } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import LinkButton from './link';

import styles from './button.module.scss';

interface Props {
  children: ReactNode;
  rightIcon?: ReactNode;
  to: string;
}

const BackButton = ({ children, rightIcon, to }: Props) => (
  <LinkButton className={styles.back} leftIcon={<FaArrowLeft />} rightIcon={rightIcon} to={to}>
    {children}
  </LinkButton>
);

export default BackButton;
