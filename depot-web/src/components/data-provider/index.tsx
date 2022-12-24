import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

// components
import Layout from '../layout';

// data
import DataIndexAtom from './index-atom';

// hooks
import useFetch from '../../hooks/use-fetch';
import useLocalStorage from '../../hooks/use-local-storage';

interface Props {
  children: React.ReactNode;
}

const DataProvider = ({ children }: Props) => {
  const [settings, setSettings] = useLocalStorage<depot.Settings>('settings');
  const setDataIndex = useSetRecoilState(DataIndexAtom);

  const { data, loading: fetching } = useFetch<depot.Index[]>('/data/index.json');
  const [hasStored, setHasStored] = useState(false);
  const [isStoring, setIsStoring] = useState(false);

  const loading = fetching || (isStoring && !hasStored);

  useEffect(() => {
    if (!hasStored && data) {
      setIsStoring(true);
      setDataIndex(data);
      setHasStored(true);
    }
  }, [data, hasStored, setHasStored]);

  useEffect(() => {
    if (!settings) {
      setSettings({ showLegends: true, showForgeWorld: true });
    }
  }, [settings, setSettings]);

  return loading ? (
    <Layout title="Loading" isLoading>
      {children}
    </Layout>
  ) : (
    <>{children}</>
  );
};

export default DataProvider;
