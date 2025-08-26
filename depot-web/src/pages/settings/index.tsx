import { useCallback } from 'react';
import { Button, Loader, SelectField, Stat, useToast } from '@fjlaubscher/matter';
import useLocalStorage from '@/hooks/use-local-storage';
import { useAsyncFn, useMount } from 'react-use';
import { depot } from 'depot-core';

// components
import Layout from '@/components/layout';

// indexedDB
import { destroy, getFactions } from '@/data/indexed-db';

import styles from './settings.module.scss';

const YES_NO = [
  { value: 1, description: 'Yes' },
  { value: 0, description: 'No' }
];

const Settings = () => {
  const toast = useToast();
  const [{ value: offlineFactions, loading }, readData] = useAsyncFn(getFactions);
  const [settings, setSettings] = useLocalStorage<depot.Settings>('settings');

  const handleReset = useCallback(async () => {
    await destroy();
    readData();
    toast({ variant: 'success', text: 'Offline data deleted.' });
  }, []);

  useMount(readData);

  return (
    <Layout title="Settings">
      <div className={styles.section}>
        <Stat className={styles.heading} title="Settings" value="Datasheets" />
        <SelectField
          label="Show Forge World"
          name="showForgeWorld"
          options={YES_NO}
          value={Number(settings?.showForgeWorld)}
          onChange={(value) => setSettings({ ...settings, showForgeWorld: !!value })}
        />
        <SelectField
          label="Show Legends"
          name="showLegends"
          options={YES_NO}
          value={Number(settings?.showLegends)}
          onChange={(value) => setSettings({ ...settings, showLegends: !!value })}
        />
      </div>
      <div className={styles.section}>
        <Stat className={styles.heading} title="Settings" value="Offline Data" />
        {loading && <Loader />}
        {!loading && offlineFactions && (
          <>
            <ul className={styles.offline}>
              {offlineFactions.map((f) => (
                <li key={`faction-${f.id}`}>{f.name}</li>
              ))}
            </ul>
            <Button variant="error" onClick={handleReset}>
              Delete Offline Data
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
