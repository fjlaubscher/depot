import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

import styles from './card.module.scss';

interface Props {
  children: React.ReactNode;
  to: string;
}

const LinkCard: React.FC<Props> = ({ children, to }) => (
  <Link className={styles.link} to={to}>
    <div>{children}</div>
    <FiChevronRight />
  </Link>
);

export default LinkCard;
