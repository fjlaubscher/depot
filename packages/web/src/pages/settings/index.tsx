import { useCallback } from 'react';
import type { depot } from '@depot/core';

// UI Components
import AppLayout from '@/components/layout';
import { Button, Loader, PageHeader } from '@/components/ui';

// Components
import SettingsCard from './components/settings-card';
import SettingToggleItem from './components/setting-toggle-item';

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
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Settings"
          subtitle="Configure your app preferences and manage offline data"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Faction Preferences Card */}
          <SettingsCard title="Faction Preferences" description="Choose which factions to display">
            <div className="flex flex-col gap-4">
              <SettingToggleItem
                title="Forge World Units"
                description="Show Forge World datasheets and rules"
                enabled={state.settings?.showForgeWorld || false}
                onChange={(value) => handleSettingsChange('showForgeWorld', value)}
              />
              <SettingToggleItem
                title="Legends Units"
                description="Show legacy Legends datasheets"
                enabled={state.settings?.showLegends || false}
                onChange={(value) => handleSettingsChange('showLegends', value)}
              />
              <SettingToggleItem
                title="Unaligned Factions"
                description="Show factions without specific allegiances"
                enabled={state.settings?.showUnaligned ?? true}
                onChange={(value) => handleSettingsChange('showUnaligned', value)}
              />
            </div>
          </SettingsCard>

          {/* Datasheet Preferences Card */}
          <SettingsCard
            title="Datasheet Preferences"
            description="Customize how datasheets are displayed"
          >
            <div className="flex flex-col gap-4">
              <SettingToggleItem
                title="Show Fluff Text"
                description="Display lore and background text. Disable if you're a heretic who only cares about numbers."
                enabled={state.settings?.showFluff ?? true}
                onChange={(value) => handleSettingsChange('showFluff', value)}
              />
            </div>
          </SettingsCard>

          {/* Offline Data Card */}
          <SettingsCard
            title="Offline Data"
            description="Manage cached faction data for offline use"
          >
            {state.loading ? (
              <div className="flex justify-center py-8">
                <Loader size="md" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {state.offlineFactions && state.offlineFactions.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-3">
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
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Visit faction pages to cache data offline
                    </div>
                  </div>
                )}
              </div>
            )}
          </SettingsCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
