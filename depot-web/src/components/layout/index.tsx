import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { Layout } from '@fjlaubscher/matter';

interface Props {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  isLoading?: boolean;
}

const AppLayout = ({ children, title, action, isLoading }: Props) => {
  return (
    <Layout
      action={action}
      title={title}
      home={
        <Link to="/">
          <FaClipboardList />
        </Link>
      }
      isLoading={isLoading}
    >
      <Helmet title={`${title} | depot`} />
      {children}
    </Layout>
  );
};

export default AppLayout;
