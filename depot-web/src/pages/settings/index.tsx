import { useCallback, useEffect, useState } from 'react';
import { depot } from 'depot-core';

// UI Components
import Layout from '@/components/ui/layout';
import Button from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import SelectField from '@/components/ui/select-field';
import Stat from '@/components/ui/stat';

// Hooks and Context
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from '@/contexts/toast/use-toast-context';

// Data
import { destroy, getFactions } from '@/data/indexed-db';

const YES_NO = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' }
];

const Settings = () => {
  const { showToast } = useToast();
  const [offlineFactions, setOfflineFactions] = useState<depot.Option[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useLocalStorage<depot.Settings>('settings');

  const loadOfflineData = useCallback(async () => {
    try {
      setLoading(true);
      const factions = await getFactions();
      setOfflineFactions(factions);
    } catch (error) {
      console.error('Failed to load offline factions:', error);
      setOfflineFactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await destroy();
      await loadOfflineData();
      showToast({ type: 'success', title: 'Success', message: 'Offline data deleted.' });
    } catch (error) {
      console.error('Failed to delete offline data:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete offline data.' });
    }
  }, [loadOfflineData, showToast]);

  // Load offline data on mount
  useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  return (
    <Layout title="Settings">
      <div className="space-y-8">
        {/* Datasheet Settings Section */}
        <div className="space-y-4">
          <Stat title="Settings" value="Datasheets" variant="large" />
          <div className="space-y-4">
            <SelectField
              label="Show Forge World"
              name="showForgeWorld"
              options={YES_NO}
              value={settings?.showForgeWorld ? 'true' : 'false'}
              onChange={(e) =>
                setSettings({ ...settings, showForgeWorld: e.target.value === 'true' })
              }
            />
            <SelectField
              label="Show Legends"
              name="showLegends"
              options={YES_NO}
              value={settings?.showLegends ? 'true' : 'false'}
              onChange={(e) => setSettings({ ...settings, showLegends: e.target.value === 'true' })}
            />
          </div>
        </div>

        {/* Offline Data Section */}
        <div className="space-y-4">
          <Stat title="Settings" value="Offline Data" variant="large" />
          {loading && (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          )}
          {!loading && offlineFactions && offlineFactions.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Cached factions for offline use:
                </p>
                <ul className="space-y-2">
                  {offlineFactions.map((f) => (
                    <li
                      key={`faction-${f.id}`}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      • {f.name}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="error" onClick={handleReset}>
                Delete Offline Data
              </Button>
            </div>
          )}
          {!loading && (!offlineFactions || offlineFactions.length === 0) && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No offline data cached. Visit faction pages to cache data for offline use.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
