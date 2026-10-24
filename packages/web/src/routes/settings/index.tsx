import type { depot } from '@depot/core';
import { useTranslation } from 'react-i18next';

// UI Components
import AppLayout from '@/components/layout';
import { Button, Loader, SectionHeader, SelectField } from '@/components/ui';

// Components
import AppVersion from '@/components/shared/app-version';
import DataVersion from '@/components/shared/data-version';
import SettingToggleItem from './_components/setting-toggle-item';
import StorageUsage from './_components/storage-usage';
import ThemePicker from './_components/theme-picker';

// Hooks and Context
import { useSettingsContext } from '@/contexts/settings/context';
import { useFactionsContext } from '@/contexts/factions/context';
import { useToast } from '@/contexts/toast/context';
import { promptInstall, usePwaInstall } from '@/hooks/use-pwa-install';
import { shouldShowInstallAffordance } from '@/lib/pwa-install';

const Settings = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettingsContext();
  const { offlineFactions, clearOfflineData, loading } = useFactionsContext();
  const pwa = usePwaInstall();
  const installable = shouldShowInstallAffordance({
    hasPrompt: pwa.hasPrompt,
    standalone: pwa.standalone
  });

  const handleSettingsChange = async (
    field: keyof depot.Settings,
    value: depot.Settings[keyof depot.Settings]
  ) => {
    try {
      await updateSettings({ ...settings, [field]: value });
    } catch (error) {
      console.error('Failed to update settings:', error);
      showToast({
        type: 'error',
        title: t('common:error.label'),
        message: t('common:settingsNotifications.saveError'),
        translation: { title: 'error.label', message: 'settingsNotifications.saveError' }
      });
    }
  };

  const handleReset = async () => {
    try {
      await clearOfflineData();
      showToast({
        type: 'success',
        title: t('common:settingsNotifications.cacheCleared'),
        message: t('common:settingsNotifications.cacheClearedMessage'),
        translation: {
          title: 'settingsNotifications.cacheCleared',
          message: 'settingsNotifications.cacheClearedMessage'
        }
      });
    } catch (error) {
      console.error('Failed to delete offline data:', error);
      showToast({
        type: 'error',
        title: t('common:error.label'),
        message: t('common:settingsNotifications.cacheError'),
        translation: { title: 'error.label', message: 'settingsNotifications.cacheError' }
      });
    }
  };

  return (
    <AppLayout title={t('documentTitle')}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>

        <section className="flex flex-col gap-2">
          <SectionHeader title={t('appearance')} />
          <ThemePicker
            value={settings.theme ?? 'system'}
            onChange={(theme) => handleSettingsChange('theme', theme)}
          />
          <SelectField
            id="interface-language"
            label={t('language')}
            value={settings.language ?? 'auto'}
            options={[
              { value: 'auto', label: t('automaticLanguage') },
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' }
            ]}
            onChange={(event) =>
              handleSettingsChange(
                'language',
                event.currentTarget.value as depot.Settings['language']
              )
            }
          />
        </section>

        {installable && (
          <section className="flex flex-col gap-2">
            <SectionHeader title={t('common:install.title')} />
            <div className="surface-card flex items-center justify-between gap-3 p-3">
              <p className="text-sm text-body">{t('installDescription')}</p>
              <Button
                type="button"
                size="sm"
                disabled={pwa.busy}
                onClick={() => {
                  void promptInstall();
                }}
              >
                {t('common:install.action')}
              </Button>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <SectionHeader title={t('factions')} />
          <SettingToggleItem
            title={t('forgeWorld.title')}
            description={t('forgeWorld.description')}
            enabled={settings.showForgeWorld || false}
            onChange={(value) => handleSettingsChange('showForgeWorld', value)}
          />
          <SettingToggleItem
            title={t('legends.title')}
            description={t('legends.description')}
            enabled={settings.showLegends || false}
            onChange={(value) => handleSettingsChange('showLegends', value)}
          />
          <SettingToggleItem
            title={t('unaligned.title')}
            description={t('unaligned.description')}
            enabled={settings.showUnaligned ?? false}
            onChange={(value) => handleSettingsChange('showUnaligned', value)}
          />
          <SettingToggleItem
            title={t('fluff.title')}
            description={t('fluff.description')}
            enabled={settings.showFluff ?? true}
            onChange={(value) => handleSettingsChange('showFluff', value)}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title={t('sharing')} />
          <SettingToggleItem
            title={t('wargear.title')}
            description={t('wargear.description')}
            enabled={settings.includeWargearOnExport ?? true}
            onChange={(value) => handleSettingsChange('includeWargearOnExport', value)}
          />
          <SettingToggleItem
            title={t('nativeShare.title')}
            description={t('nativeShare.description')}
            enabled={settings.useNativeShare ?? true}
            onChange={(value) => handleSettingsChange('useNativeShare', value)}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title={t('offline.title')} />

          <div className="surface-card flex flex-col gap-3 p-3">
            <div className="flex flex-col gap-1">
              <AppVersion />
              <DataVersion />
            </div>
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
                          ? t('offline.factionOnly')
                          : t('offline.datasheetCount', { count: f.cachedDatasheets })}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="error" onClick={handleReset} size="sm" fullWidth>
                  {t('offline.clear')}
                </Button>
                <p className="text-xs text-subtle">{t('offline.description')}</p>
              </>
            ) : (
              <p className="text-sm text-subtle">{t('offline.empty')}</p>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Settings;
