import type { depot } from '@depot/core';

// UI Components
import AppLayout from '@/components/layout';
import { Button, Loader, SectionHeader } from '@/components/ui';

// Components
import SettingToggleItem from './_components/setting-toggle-item';
import StorageUsage from './_components/storage-usage';
import ThemePicker from './_components/theme-picker';

// Hooks and Context
import { useSettingsContext } from '@/contexts/settings/context';
import { useFactionsContext } from '@/contexts/factions/context';
import { useToast } from '@/contexts/toast/context';

const Settings = () => {
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettingsContext();
  const { offlineFactions, clearOfflineData, loading, dataVersion } = useFactionsContext();

  const handleSettingsChange = async (
    field: keyof depot.Settings,
    value: depot.Settings[keyof depot.Settings]
  ) => {
    try {
      await updateSettings({ ...settings, [field]: value });
    } catch (error) {
      console.error('Failed to update settings:', error);
      showToast({ type: 'error', title: 'Error', message: 'Failed to save settings.' });
    }
  };

  const handleReset = async () => {
    try {
      await clearOfflineData();
      showToast({
        type: 'success',
        title: 'Offline cache cleared',
        message: 'Cached faction packs and datasheets were removed.'
      });
    } catch (error) {
      console.error('Failed to delete offline data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear the offline cache.'
      });
    }
  };

  return (
    <AppLayout title="Settings & Preferences">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Appearance" />
          <ThemePicker
            value={settings.theme ?? 'system'}
            onChange={(theme) => handleSettingsChange('theme', theme)}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Factions" />
          <SettingToggleItem
            title="Forge World Units"
            description="Show Forge World datasheets and rules"
            enabled={settings.showForgeWorld || false}
            onChange={(value) => handleSettingsChange('showForgeWorld', value)}
          />
          <SettingToggleItem
            title="Legends Units"
            description="Show legacy Legends datasheets"
            enabled={settings.showLegends || false}
            onChange={(value) => handleSettingsChange('showLegends', value)}
          />
          <SettingToggleItem
            title="Unaligned Factions"
            description="Show factions without specific allegiances"
            enabled={settings.showUnaligned ?? false}
            onChange={(value) => handleSettingsChange('showUnaligned', value)}
          />
          <SettingToggleItem
            title="Show Fluff Text"
            description="Display lore and background text. Disable if you're a heretic who only cares about numbers."
            enabled={settings.showFluff ?? true}
            onChange={(value) => handleSettingsChange('showFluff', value)}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Sharing" />
          <SettingToggleItem
            title="Include Wargear"
            description="Add selected wargear when sharing rosters"
            enabled={settings.includeWargearOnExport ?? true}
            onChange={(value) => handleSettingsChange('includeWargearOnExport', value)}
          />
          <SettingToggleItem
            title="Use Native Sharing"
            description="Attempt to use the device share sheet when available; otherwise copy to clipboard"
            enabled={settings.useNativeShare ?? true}
            onChange={(value) => handleSettingsChange('useNativeShare', value)}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Offline data" count={dataVersion ?? undefined} />

          <div className="surface-card flex flex-col gap-3 p-3">
            <StorageUsage />

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader size="md" />
              </div>
            ) : offlineFactions && offlineFactions.length > 0 ? (
              <>
                <div className="flex flex-col gap-1">
                  {offlineFactions.map((f) => (
                    <div
                      key={`faction-${f.id}`}
                      className="flex items-center gap-2 text-sm text-body"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-accent-600 dark:bg-accent-500" />
                      <span className="truncate">{f.name}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] font-medium uppercase text-subtle">
                        {f.cachedDatasheets === 0
                          ? 'faction only'
                          : `${f.cachedDatasheets} datasheet${f.cachedDatasheets === 1 ? '' : 's'}`}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="error" onClick={handleReset} size="sm" fullWidth>
                  Clear offline cache
                </Button>
                <p className="text-xs text-subtle">
                  Removes cached faction packs and datasheets. Rosters, collections, and bookmarks
                  stay. Faction data is re-cached as you browse.
                </p>
              </>
            ) : (
              <p className="text-sm text-subtle">
                Nothing cached yet — visit a faction page and it is stored for offline use.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Settings;
