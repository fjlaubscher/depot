import { useEffect } from 'react';
import { depot } from "@depot/core";
import { useAppContext } from '@/contexts/app/use-app-context';
import useLocalStorage from '@/hooks/use-local-storage';

// components
import Layout from '../layout';

interface Props {
  children: React.ReactNode;
}

const DataProvider = ({ children }: Props) => {
  const { state } = useAppContext();
  const [settings, setSettings] = useLocalStorage<depot.Settings>('settings');

  useEffect(() => {
    if (!settings) {
      setSettings({ showLegends: true, showForgeWorld: true });
    }
  }, [settings, setSettings]);

  return state.loading ? (
    <Layout title="Loading" isLoading>
      {children}
    </Layout>
  ) : (
    <>{children}</>
  );
};

export default DataProvider;
