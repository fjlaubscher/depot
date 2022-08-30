import React, { useEffect, useState } from 'react';

// components
import Layout from '../layout';

// data
import { init } from '../../data/indexed-db';

// hooks
import useWahapedia from '../../hooks/use-wahapedia';

interface Props {
  children: React.ReactNode;
}

const DataProvider: React.FC<Props> = ({ children }) => {
  const [hasStored, setHasStored] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const { data, loading: fetching, error } = useWahapedia();

  const loading = fetching || (isStoring && !hasStored);

  useEffect(() => {
    if (!hasStored && data) {
      setIsStoring(true);
      init(data.data).then(() => setHasStored(true));
    }
  }, [data, hasStored, setHasStored]);

  return loading ? (
    <Layout title="Loading" isLoading>
      {children}
    </Layout>
  ) : (
    <>{children}</>
  );
};

export default DataProvider;
