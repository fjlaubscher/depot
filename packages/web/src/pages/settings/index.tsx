import { useCallback } from 'react';
import { depot } from '@depot/core';

// UI Components
import AppLayout from '@/components/layout';
import { Button, Loader, ToggleSwitch, PageHeader, Card } from '@/components/ui';

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
      <PageHeader
        title="Settings"
        subtitle="Configure your app preferences and manage offline data"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Content Preferences Card */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Content Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose which content to display in datasheets
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Forge World Units
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Show Forge World datasheets and rules
                </div>
              </div>
              <ToggleSwitch
                label=""
                enabled={state.settings?.showForgeWorld || false}
                onChange={(value) => handleSettingsChange('showForgeWorld', value)}
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Legends Units
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Show legacy Legends datasheets
                </div>
              </div>
              <ToggleSwitch
                label=""
                enabled={state.settings?.showLegends || false}
                onChange={(value) => handleSettingsChange('showLegends', value)}
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Unaligned Factions
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Show factions without specific allegiances
                </div>
              </div>
              <ToggleSwitch
                label=""
                enabled={state.settings?.showUnaligned ?? true}
                onChange={(value) => handleSettingsChange('showUnaligned', value)}
                size="sm"
              />
            </div>
          </div>
        </Card>

        {/* Offline Data Card */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offline Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage cached faction data for offline use
            </p>
          </div>

          {state.loading ? (
            <div className="flex justify-center py-8">
              <Loader size="md" />
            </div>
          ) : (
            <div className="space-y-4">
              {state.offlineFactions && state.offlineFactions.length > 0 ? (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Cached Factions
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        {state.offlineFactions.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {state.offlineFactions.slice(0, 4).map((f) => (
                        <div
                          key={`faction-${f.id}`}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-3"
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                      ))}
                      {state.offlineFactions.length > 4 && (
                        <div className="text-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{state.offlineFactions.length - 4} more factions cached
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="error" onClick={handleReset} size="sm" fullWidth>
                    Clear All Offline Data
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No offline data cached
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Visit faction pages to cache data offline
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
