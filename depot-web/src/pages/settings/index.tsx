import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { Alert, Button } from '@fjlaubscher/matter';

// components
import Layout from '../../components/layout';

// indexedDB
import { destroy } from '../../data/indexed-db';

const Settings = () => {
  const { mutate } = useSWRConfig();

  const handleReset = useCallback(async () => {
    await destroy();
    mutate('/wahapedia.json');
  }, [mutate]);

  return (
    <Layout title="Settings">
      <Alert variant="info">Click the button to clear local data.</Alert>
      <Button primary onClick={handleReset}>
        Reset
      </Button>
    </Layout>
  );
};

export default Settings;
