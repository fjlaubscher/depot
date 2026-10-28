import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { depot } from '@depot/core';
import { SettingsProvider, useSettingsContext } from './context';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import i18n from '@/i18n';

const mockOfflineStorage = vi.hoisted(() => ({
  getSettings: vi.fn(),
  setSettings: vi.fn()
}));

vi.mock('../../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

const TestComponent = () => {
  const { settings, updateSettings } = useSettingsContext();
  const { t } = useTranslation('home');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const handleUpdate = async () => {
    setStatus('saving');
    await updateSettings({ ...settings, showForgeWorld: true });
    setStatus('done');
  };

  return (
    <div>
      <div data-testid="settings">{JSON.stringify(settings)}</div>
      <div data-testid="local-status">{status}</div>
      <div data-testid="translation">{t('bookmarks')}</div>
      {(['auto', 'fr', 'en'] as const).map((language) => (
        <button key={language} onClick={() => void updateSettings({ ...settings, language })}>
          {language}
        </button>
      ))}
      <button onClick={() => void handleUpdate()} data-testid="update-settings">
        Update
      </button>
    </div>
  );
};

describe('SettingsProvider', () => {
  const mockSettings: depot.Settings = {
    showForgeWorld: false,
    showLegends: true,
    showUnaligned: false,
    showFluff: true,
    includeWargearOnExport: true,
    useNativeShare: true
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.setSettings.mockResolvedValue(undefined);
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en']);
    await i18n.changeLanguage('en');
    document.documentElement.lang = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('toggles the hide-fluff root class from showFluff', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue({ ...mockSettings, showFluff: false });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await waitFor(() =>
      expect(document.documentElement.classList.contains('hide-fluff')).toBe(true)
    );
  });

  it.each([
    ['dark', true],
    ['light', false]
  ] as const)(
    'applies the %s theme as a root class and mirrors it to localStorage',
    async (theme, expectDark) => {
      mockOfflineStorage.getSettings.mockResolvedValue({ ...mockSettings, theme });
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(expectDark);
        expect(localStorage.getItem('depot-theme')).toBe(theme);
      });
    }
  );

  it('follows the OS when the theme is system', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as MediaQueryList);

    mockOfflineStorage.getSettings.mockResolvedValue({ ...mockSettings, theme: 'system' });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true));
  });

  it('loads settings from IndexedDB and merges with defaults', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(mockSettings);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveTextContent(
        JSON.stringify({ ...DEFAULT_SETTINGS, ...mockSettings })
      );
    });

    expect(mockOfflineStorage.getSettings).toHaveBeenCalled();
  });

  it('falls back to defaults when no stored settings exist', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(DEFAULT_SETTINGS));
    });
  });

  it('updates settings and persists to IndexedDB', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const updateButton = screen.getByTestId('update-settings');

    await act(async () => {
      updateButton.click();
    });

    const expectedSettings = { ...DEFAULT_SETTINGS, showForgeWorld: true };

    await waitFor(() => {
      expect(mockOfflineStorage.setSettings).toHaveBeenCalledWith(expectedSettings);
      expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(expectedSettings));
    });
  });

  it.each([
    ['fr', ['en'], 'Favoris'],
    ['en', ['fr-FR'], 'Bookmarks']
  ] as const)('applies stored %s over browser preferences', async (language, languages, label) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
    mockOfflineStorage.getSettings.mockResolvedValue({ ...mockSettings, language });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('translation')).toHaveTextContent(label);
      expect(document.documentElement.lang).toBe(language);
      expect(i18n.language).toBe(language);
    });
  });

  it.each([null, mockSettings])(
    'uses browser language for missing language in %j',
    async (stored) => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de', 'fr-CA', 'en']);
      mockOfflineStorage.getSettings.mockResolvedValue(stored);
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
        expect(document.documentElement.lang).toBe('fr');
        expect(JSON.parse(screen.getByTestId('settings').textContent!)).toMatchObject({
          language: 'auto',
          showLegends: stored?.showLegends ?? false
        });
      });
    }
  );

  it('finishes language synchronization with defaults after a read error', async () => {
    const error = new Error('read failed');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockOfflineStorage.getSettings.mockRejectedValue(error);
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr']);
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
      expect(document.documentElement.lang).toBe('fr');
    });
    expect(warn).toHaveBeenCalledWith('Failed to load settings from IndexedDB:', error);
  });

  it('waits for stored settings before synchronizing language', async () => {
    let finishLoad!: (settings: depot.Settings) => void;
    mockOfflineStorage.getSettings.mockReturnValue(
      new Promise((resolve) => {
        finishLoad = resolve;
      })
    );
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    expect(document.documentElement.lang).toBe('');

    await act(async () => {
      finishLoad({ language: 'fr' });
    });
    expect(document.documentElement.lang).toBe('fr');
    expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
  });

  it('persists language and other preferences across a provider remount', async () => {
    let stored: depot.Settings = { ...mockSettings, theme: 'dark', useNativeShare: false };
    mockOfflineStorage.getSettings.mockImplementation(async () => stored);
    mockOfflineStorage.setSettings.mockImplementation(async (next: depot.Settings) => {
      stored = next;
    });
    const view = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await waitFor(() => expect(screen.getByTestId('settings')).toHaveTextContent('"theme":"dark"'));
    await act(async () => {
      screen.getByRole('button', { name: 'fr' }).click();
    });
    view.unmount();

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
      expect(JSON.parse(screen.getByTestId('settings').textContent!)).toMatchObject({
        language: 'fr',
        theme: 'dark',
        showLegends: true,
        useNativeShare: false
      });
      expect(document.documentElement.lang).toBe('fr');
    });
  });

  it('applies language in memory and logs a failed save', async () => {
    const error = new Error('save failed');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOfflineStorage.setSettings.mockRejectedValue(error);
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {});
    await act(async () => {
      screen.getByRole('button', { name: 'fr' }).click();
    });

    expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
    expect(document.documentElement.lang).toBe('fr');
    expect(log).toHaveBeenCalledWith('Failed to save settings to IndexedDB:', error);
  });

  it('ignores browser changes and reuses initial detection when returning to automatic', async () => {
    const languages = vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR']);
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await waitFor(() => expect(screen.getByTestId('translation')).toHaveTextContent('Favoris'));

    languages.mockReturnValue(['en']);
    await act(async () => {
      window.dispatchEvent(new Event('languagechange'));
    });
    expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
    await act(async () => {
      screen.getByRole('button', { name: 'en' }).click();
    });
    expect(document.documentElement.lang).toBe('en');
    await act(async () => {
      screen.getByRole('button', { name: 'auto' }).click();
    });
    expect(screen.getByTestId('translation')).toHaveTextContent('Favoris');
    expect(document.documentElement.lang).toBe('fr');
  });
});
