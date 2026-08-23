import { Button } from '@/components/ui';
import { dismissInstallBanner, promptInstall, usePwaInstall } from '@/hooks/use-pwa-install';
import { shouldShowInstallBanner } from '@/lib/pwa-install';

const InstallBanner = () => {
  const pwa = usePwaInstall();
  const visible = shouldShowInstallBanner({
    hasPrompt: pwa.hasPrompt,
    standalone: pwa.standalone,
    dismissed: pwa.bannerDismissed
  });

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Install"
      data-testid="install-banner"
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border-accent bg-surface-accent px-4 py-3"
    >
      <p className="min-w-0 flex-1 text-sm leading-snug text-body">
        Install depot for offline use.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pwa.busy}
          onClick={() => {
            void promptInstall();
          }}
        >
          Install
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={dismissInstallBanner}>
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export default InstallBanner;
