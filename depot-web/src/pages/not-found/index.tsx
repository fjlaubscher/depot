import { useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { useToast } from '@fjlaubscher/matter';

// components
import Layout from '../../components/layout';

import styles from './not-found.module.scss';

const NotFound = () => {
  const toast = useToast();

  useEffect(() => {
    toast({
      variant: 'error',
      text: `The page you're looking for doesn't exist!`
    });
  }, []);

  return (
    <Layout title="Not Found">
      <div className={styles.content}>
        <FaClipboardList className={styles.notFound} />
      </div>
    </Layout>
  );
};

export default NotFound;