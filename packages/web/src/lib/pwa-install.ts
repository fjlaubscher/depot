/** Install-prompt visibility. Chrome only fires beforeinstallprompt after its
   engagement heuristic, and never when the app is already a WebAPK. */

/** localStorage flag so the banner does not nag. Settings stays available. */
export const INSTALL_BANNER_KEY = 'depot-install-banner';

const STANDALONE_MODES = new Set(['standalone', 'fullscreen', 'window-controls-overlay']);

export type StandaloneOpts = {
  displayMode: string | null;
  navigatorStandalone?: boolean;
  referrer?: string;
};

/** Installed PWA (Chrome WebAPK, iOS home screen, TWA). */
export function isStandaloneDisplay(opts: StandaloneOpts): boolean {
  if (opts.displayMode && STANDALONE_MODES.has(opts.displayMode)) return true;
  if (opts.navigatorStandalone) return true;
  if (opts.referrer?.startsWith('android-app://')) return true;
  return false;
}

/** Map matchMedia checks to a CSS display-mode value. */
export function displayModeFromMatchMedia(matches: (query: string) => boolean): string {
  if (matches('(display-mode: standalone)')) return 'standalone';
  if (matches('(display-mode: fullscreen)')) return 'fullscreen';
  if (matches('(display-mode: window-controls-overlay)')) return 'window-controls-overlay';
  return 'browser';
}

export type InstallVisibility = {
  hasPrompt: boolean;
  standalone: boolean;
};

/** Settings row — always on while Chrome has given us a deferred prompt. */
export function shouldShowInstallAffordance(opts: InstallVisibility): boolean {
  return opts.hasPrompt && !opts.standalone;
}

/** One-time banner. Hidden after dismiss; Settings is independent. */
export function shouldShowInstallBanner(opts: InstallVisibility & { dismissed: boolean }): boolean {
  return shouldShowInstallAffordance(opts) && !opts.dismissed;
}
