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
      className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border-accent bg-surface-accent px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm leading-snug font-semibold text-foreground">Install depot</p>
        <p className="max-w-[52ch] text-[12.5px] leading-normal text-body">
          Add it to your home screen and depot opens like an app — full screen, no address bar, and
          every faction you've downloaded still opens with no signal at the table.
        </p>
      </div>
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
