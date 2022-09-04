import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { GiBolterGun } from 'react-icons/gi';
import { Helmet } from 'react-helmet';

// components
import Container from '../container';
import Progress from '../progress';

import styles from './layout.module.scss';

interface Props {
  children: React.ReactNode;
  title: string;
  backLink?: string;
  action?: React.ReactNode;
  isLoading?: boolean;
}

const Layout = ({ backLink, children, title, action, isLoading }: Props) => {
  return (
    <div className={styles.container}>
      <Helmet title={`${title} | depot`} />
      <div className={styles.navbar}>
        <Link className={styles.home} to={backLink || '/'}>
          {backLink ? <FiArrowLeft /> : <GiBolterGun />}
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.action}>{action}</div>
      </div>
      {isLoading ? <Progress /> : <Container className={styles.content}>{children}</Container>}
    </div>
  );
};

export default Layout;
