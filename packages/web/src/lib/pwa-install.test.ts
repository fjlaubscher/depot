import { describe, expect, it } from 'vitest';
import {
  INSTALL_BANNER_KEY,
  displayModeFromMatchMedia,
  isStandaloneDisplay,
  shouldShowInstallAffordance,
  shouldShowInstallBanner
} from './pwa-install';

describe('isStandaloneDisplay', () => {
  it('treats standalone and related display-modes as installed', () => {
    expect(isStandaloneDisplay({ displayMode: 'standalone' })).toBe(true);
    expect(isStandaloneDisplay({ displayMode: 'fullscreen' })).toBe(true);
    expect(isStandaloneDisplay({ displayMode: 'window-controls-overlay' })).toBe(true);
  });

  it('treats iOS home-screen and Android TWA as installed', () => {
    expect(isStandaloneDisplay({ displayMode: 'browser', navigatorStandalone: true })).toBe(true);
    expect(
      isStandaloneDisplay({
        displayMode: 'browser',
        referrer: 'android-app://com.google.android.gms'
      })
    ).toBe(true);
  });

  it('leaves a normal browser tab alone', () => {
    expect(isStandaloneDisplay({ displayMode: 'browser' })).toBe(false);
    expect(isStandaloneDisplay({ displayMode: null })).toBe(false);
    expect(
      isStandaloneDisplay({ displayMode: 'browser', referrer: 'https://depot.example/rosters' })
    ).toBe(false);
  });
});

describe('displayModeFromMatchMedia', () => {
  it('picks the first matching installed mode', () => {
    expect(displayModeFromMatchMedia((q) => q.includes('standalone'))).toBe('standalone');
    expect(displayModeFromMatchMedia((q) => q.includes('fullscreen'))).toBe('fullscreen');
    expect(displayModeFromMatchMedia((q) => q.includes('window-controls-overlay'))).toBe(
      'window-controls-overlay'
    );
    expect(displayModeFromMatchMedia(() => false)).toBe('browser');
  });
});

describe('shouldShowInstallAffordance', () => {
  it('shows Settings only with a deferred prompt and not already installed', () => {
    expect(shouldShowInstallAffordance({ hasPrompt: true, standalone: false })).toBe(true);
    expect(shouldShowInstallAffordance({ hasPrompt: false, standalone: false })).toBe(false);
    expect(shouldShowInstallAffordance({ hasPrompt: true, standalone: true })).toBe(false);
    expect(shouldShowInstallAffordance({ hasPrompt: false, standalone: true })).toBe(false);
  });
});

describe('shouldShowInstallBanner', () => {
  it('is the Settings rule plus a one-time dismiss', () => {
    expect(shouldShowInstallBanner({ hasPrompt: true, standalone: false, dismissed: false })).toBe(
      true
    );
    expect(shouldShowInstallBanner({ hasPrompt: true, standalone: false, dismissed: true })).toBe(
      false
    );
    expect(shouldShowInstallBanner({ hasPrompt: false, standalone: false, dismissed: false })).toBe(
      false
    );
    expect(shouldShowInstallBanner({ hasPrompt: true, standalone: true, dismissed: false })).toBe(
      false
    );
  });

  it('keeps the dismiss key stable so an old dismiss still counts', () => {
    expect(INSTALL_BANNER_KEY).toBe('depot-install-banner');
  });
});
