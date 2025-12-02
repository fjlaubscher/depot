import { useCallback } from 'react';
import type { depot } from '@depot/core';
import { Users, ClipboardList, Boxes, Database } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import { Button, Loader, PageHeader } from '@/components/ui';

// Components
import SettingsCard from './_components/settings-card';
import SettingToggleItem from './_components/setting-toggle-item';

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
      showToast({ type: 'success', title: 'Success', message: 'Cached faction data deleted.' });
    } catch (error) {
      console.error('Failed to delete offline data:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete cached factions.' });
    }
  }, [clearOfflineData, showToast]);

  return (
    <AppLayout title="Settings & Preferences">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Settings"
          subtitle="Configure your app preferences and manage offline data"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Collection Preferences Card */}
          <SettingsCard
            icon={<Boxes size={20} />}
            title="Collection Preferences"
            description="Control how collections are displayed"
          >
            <div className="flex flex-col gap-4">
              <SettingToggleItem
                title="Call It What It Is"
                description={`Use "Pile of Shame" instead of "Collection" across the app.`}
                enabled={state.settings?.usePileOfShameLabel ?? true}
                onChange={(value) => handleSettingsChange('usePileOfShameLabel', value)}
              />
            </div>
          </SettingsCard>

          {/* Faction Preferences Card */}
          <SettingsCard
            icon={<Users size={20} />}
            title="Faction Preferences"
            description="Customize how factions and datasheets are displayed"
          >
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
                enabled={state.settings?.showUnaligned ?? false}
                onChange={(value) => handleSettingsChange('showUnaligned', value)}
              />
            </div>
            <SettingToggleItem
              title="Show Fluff Text"
              description="Display lore and background text. Disable if you're a heretic who only cares about numbers."
              enabled={state.settings?.showFluff ?? true}
              onChange={(value) => handleSettingsChange('showFluff', value)}
            />
          </SettingsCard>

          {/* Roster Preferences Card */}
          <SettingsCard
            icon={<ClipboardList size={20} />}
            title="Roster Preferences"
            description="Control how rosters are exported or shared"
          >
            <div className="flex flex-col gap-4">
              <SettingToggleItem
                title="Include Wargear"
                description="Add selected wargear when sharing rosters"
                enabled={state.settings?.includeWargearOnExport ?? true}
                onChange={(value) => handleSettingsChange('includeWargearOnExport', value)}
              />
              <SettingToggleItem
                title="Use Native Sharing"
                description="Attempt to use the device share sheet when available; otherwise copy to clipboard"
                enabled={state.settings?.useNativeShare ?? true}
                onChange={(value) => handleSettingsChange('useNativeShare', value)}
              />
              <SettingToggleItem
                title="Cogitator (Experimental)"
                description="Enable the roster analysis Cogitator tab powered by GPT."
                enabled={state.settings?.enableCogitator ?? false}
                onChange={(value) => handleSettingsChange('enableCogitator', value)}
              />
            </div>
          </SettingsCard>

          {/* Offline Data Card */}
          <SettingsCard
            icon={<Database size={20} />}
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
                    <div className="flex flex-col gap-1">
                      {state.offlineFactions.map((f) => (
                        <div
                          key={`faction-${f.id}`}
                          className="flex items-center gap-2 text-sm text-body surface-soft rounded"
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          <span className="truncate">{f.name}</span>
                          <span className="text-xs text-subtle ml-auto flex-shrink-0">
                            {f.cachedDatasheets}{' '}
                            {f.cachedDatasheets === 1 ? 'datasheet' : 'datasheets'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button variant="error" onClick={handleReset} size="sm" fullWidth>
                      Clear Cached Factions
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-sm text-subtle">No offline data cached</div>
                    <div className="text-xs text-hint">
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
