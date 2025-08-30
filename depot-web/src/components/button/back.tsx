import { ReactNode } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import LinkButton from './link';

import styles from './button.module.scss';

interface Props {
  children: ReactNode;
  to: string;
}

const BackButton = ({ children, to }: Props) => (
  <LinkButton className={styles.back} to={to}>
    <FaArrowLeft />
    {children}
  </LinkButton>
);

export default BackButton;
