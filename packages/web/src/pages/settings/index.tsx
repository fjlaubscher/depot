import { useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { depot } from '@depot/core';

// UI Components
import AppLayout from '@/components/layout';
import Button from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import NavigationButton from '@/components/ui/navigation-button';
import ToggleSwitch from '@/components/ui/toggle-switch';
import Stat from '@/components/ui/stat';

// Hooks and Context
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';

const Settings = () => {
  const { showToast } = useToast();
  const { state, updateSettings, clearOfflineData } = useAppContext();

  const handleSettingsChange = useCallback(
    async (field: keyof depot.Settings, value: boolean) => {
      const newSettings = { ...state.settings, [field]: value };
      try {
        await updateSettings(newSettings);
      } catch (error) {
        console.error('Failed to update settings:', error);
        showToast({ type: 'error', title: 'Error', message: 'Failed to save settings.' });
      }
    },
    [state.settings, updateSettings, showToast]
  );

  const handleReset = useCallback(async () => {
    try {
      await clearOfflineData();
      showToast({ type: 'success', title: 'Success', message: 'Offline data deleted.' });
    } catch (error) {
      console.error('Failed to delete offline data:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete offline data.' });
    }
  }, [clearOfflineData, showToast]);

  return (
    <AppLayout title="Settings">
      <div className="space-y-8">
        <NavigationButton to="/">
          <FaArrowLeft className="mr-2" />
          Back to Home
        </NavigationButton>

        {/* Datasheet Settings Section */}
        <div className="space-y-4">
          <Stat title="Settings" value="Datasheets" variant="large" />
          <div className="space-y-4">
            <ToggleSwitch
              label="Show Forge World"
              enabled={state.settings?.showForgeWorld || false}
              onChange={(value) => handleSettingsChange('showForgeWorld', value)}
            />
            <ToggleSwitch
              label="Show Legends"
              enabled={state.settings?.showLegends || false}
              onChange={(value) => handleSettingsChange('showLegends', value)}
            />
          </div>
        </div>

        {/* Offline Data Section */}
        <div className="space-y-4">
          <Stat title="Settings" value="Offline Data" variant="large" />
          {state.loading && (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          )}
          {!state.loading && state.offlineFactions && state.offlineFactions.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Cached factions for offline use:
                </p>
                <ul className="space-y-2">
                  {state.offlineFactions.map((f) => (
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
          {!state.loading && (!state.offlineFactions || state.offlineFactions.length === 0) && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No offline data cached. Visit faction pages to cache data for offline use.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
