import { useSyncExternalStore } from 'react';

import {
  INSTALL_BANNER_KEY,
  displayModeFromMatchMedia,
  isStandaloneDisplay
} from '@/lib/pwa-install';

/** Chrome's beforeinstallprompt — not in the default DOM lib. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export type PwaInstallState = {
  hasPrompt: boolean;
  standalone: boolean;
  bannerDismissed: boolean;
  busy: boolean;
};

const initialState: PwaInstallState = {
  hasPrompt: false,
  standalone: false,
  bannerDismissed: false,
  busy: false
};

let state: PwaInstallState = initialState;
const listeners = new Set<() => void>();

let deferred: BeforeInstallPromptEvent | null = null;
let started = false;

function emit(next: PwaInstallState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function patch(partial: Partial<PwaInstallState>) {
  emit({ ...state, ...partial });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function readStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const standalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return isStandaloneDisplay({
    displayMode: displayModeFromMatchMedia((q) => window.matchMedia(q).matches),
    navigatorStandalone: standalone,
    referrer: document.referrer
  });
}

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  const ev = e as BeforeInstallPromptEvent;
  if (typeof ev.prompt !== 'function') return;
  deferred = ev;
  patch({ hasPrompt: true });
}

function onAppInstalled() {
  deferred = null;
  patch({ hasPrompt: false, standalone: true });
  dismissInstallBanner();
}

function onDisplayModeChange() {
  const standalone = readStandalone();
  if (standalone) {
    deferred = null;
    patch({ standalone: true, hasPrompt: false });
    return;
  }
  patch({ standalone });
}

/** Idempotent. Call before first render so we hear beforeinstallprompt. */
export function initPwaInstall() {
  if (started || typeof window === 'undefined') return;
  started = true;
  let bannerDismissed = false;
  try {
    bannerDismissed = localStorage.getItem(INSTALL_BANNER_KEY) === '1';
  } catch {
    bannerDismissed = false;
  }
  emit({
    ...state,
    standalone: readStandalone(),
    bannerDismissed
  });
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  window.addEventListener('appinstalled', onAppInstalled);
  window.matchMedia('(display-mode: standalone)').addEventListener('change', onDisplayModeChange);
}

export function dismissInstallBanner() {
  patch({ bannerDismissed: true });
  try {
    localStorage.setItem(INSTALL_BANNER_KEY, '1');
  } catch {
    // Private mode — stay gone for this visit.
  }
}

/**
 * Must run from a user gesture. Consumes the stashed event; Chrome will not
 * let us prompt() it again. Banner is dismissed either way so we do not nag.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred || state.standalone || state.busy) return 'unavailable';
  const ev = deferred;
  patch({ busy: true });
  dismissInstallBanner();
  try {
    await ev.prompt();
    deferred = null;
    patch({ hasPrompt: false });
    const { outcome } = await ev.userChoice;
    if (outcome === 'accepted') patch({ standalone: true });
    return outcome;
  } catch {
    deferred = null;
    patch({ hasPrompt: false });
    return 'unavailable';
  } finally {
    patch({ busy: false });
  }
}

/** Subscribe to install-prompt state from a component. */
export function usePwaInstall(): PwaInstallState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default usePwaInstall;
