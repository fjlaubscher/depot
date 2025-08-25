import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useAsync } from 'react-use';
import { depot } from 'depot-core';
import useLocalStorage from '@/hooks/use-local-storage';

// components
import Layout from '../layout';

// data
import DataIndexAtom from './index-atom';

interface Props {
  children: React.ReactNode;
}

const DataProvider = ({ children }: Props) => {
  const [settings, setSettings] = useLocalStorage<depot.Settings>('settings');
  const setDataIndex = useSetRecoilState(DataIndexAtom);

  const { value: data, loading: fetching } = useAsync(() =>
    fetch('/data/index.json').then((r) => r.json())
  );
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
