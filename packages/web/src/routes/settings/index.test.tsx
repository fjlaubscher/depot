import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import { offlineStorage } from '@/data/offline-storage';
import i18n from '@/i18n';
import Settings from './index';
import { useFactionsContext } from '@/contexts/factions/context';
import { initialFactionsState } from '@/contexts/factions/reducer';
import { useSettingsContext } from '@/contexts/settings/context';
import ToastContainer from '@/components/ui/toast-container';

vi.mock('@/contexts/factions/context', { spy: true });
vi.mock('@/contexts/settings/context', { spy: true });

describe('Settings language', () => {
  let stored: depot.Settings | null;

  beforeEach(async () => {
    stored = { showLegends: true, showFluff: false, theme: 'dark', useNativeShare: false };
    vi.spyOn(offlineStorage, 'getSettings').mockImplementation(async () => stored);
    vi.spyOn(offlineStorage, 'setSettings').mockImplementation(async (next) => {
      stored = next;
    });
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB']);
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('labels the native selector and preserves preferences while switching languages immediately', async () => {
    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );
    const select = await screen.findByRole('combobox', { name: 'Interface language' });
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
    expect(select).toHaveValue('auto');
    expect(select).toBe(screen.getByLabelText('Interface language'));
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['System', 'Français', 'English']);
    select.focus();
    expect(select).toHaveFocus();

    fireEvent.change(select, { target: { value: 'fr' } });
    await screen.findByRole('combobox', { name: 'Langue de l’interface' });
    expect(within(select).getByRole('option', { name: 'Système' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('fr');
    await waitFor(() => expect(document.title).toBe('Paramètres et préférences | depot'));
    expect(screen.getByRole('heading', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Thème' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sombre' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch', { name: 'Unités Legends' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByText('Partager les équipements')).toBeInTheDocument();
    expect(stored).toMatchObject({
      language: 'fr',
      showLegends: true,
      showFluff: false,
      theme: 'dark',
      useNativeShare: false
    });

    fireEvent.change(select, { target: { value: 'en' } });
    await screen.findByRole('combobox', { name: 'Interface language' });
    expect(document.documentElement.lang).toBe('en');
    expect(stored?.language).toBe('en');
    await waitFor(() => expect(document.title).toBe('Settings & Preferences | depot'));
  });

  it('restores the selected language after remounting the route and providers', async () => {
    const view = render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );
    const select = await screen.findByRole('combobox', { name: 'Interface language' });
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
    fireEvent.change(select, { target: { value: 'fr' } });
    await screen.findByRole('combobox', { name: 'Langue de l’interface' });
    view.unmount();
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );
    expect(await screen.findByRole('combobox', { name: 'Langue de l’interface' })).toHaveValue(
      'fr'
    );
    expect(document.documentElement.lang).toBe('fr');
  });
});

describe('Settings translations', () => {
  const clearOfflineData = vi.fn();
  const updateSettings = vi.fn();
  const factions = {
    ...initialFactionsState,
    getFactionManifest: vi.fn(),
    getDatasheet: vi.fn(),
    clearOfflineData,
    checkForDataUpdates: vi.fn()
  };

  beforeEach(() => {
    factions.offlineFactions = [];
    factions.loading = false;
    clearOfflineData.mockReset().mockResolvedValue(undefined);
    updateSettings.mockReset().mockResolvedValue(undefined);
    vi.mocked(useFactionsContext).mockReturnValue(factions);
    vi.mocked(useSettingsContext).mockReturnValue({
      settings: { theme: 'system' },
      updateSettings
    });
  });

  afterEach(() => vi.restoreAllMocks());

  const cacheFaction = (cachedDatasheets: number) => {
    factions.offlineFactions = [
      { id: 'sm', name: 'Space Marines', slug: 'space-marines', cachedDatasheets }
    ];
  };

  it.each([
    ['en', 0, 'faction only'],
    ['en', 1, '1 datasheet'],
    ['en', 2, '2 datasheets'],
    ['fr', 0, 'faction uniquement'],
    ['fr', 1, '1 fiche'],
    ['fr', 2, '2 fiches']
  ])('translates cached counts in %s for %i sheets', async (language, count, expected) => {
    cacheFaction(count);
    await i18n.changeLanguage(language);
    render(<Settings />, { wrapper: TestWrapper });
    expect(screen.getByText('Space Marines').parentElement).toHaveTextContent(expected);
  });

  it('translates the empty and loading states', async () => {
    const view = render(<Settings />, { wrapper: TestWrapper });
    expect(screen.getByText(/Nothing cached yet/)).toBeInTheDocument();
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByText(/Aucune donnée en cache/)).toBeInTheDocument();
    factions.loading = true;
    view.rerender(<Settings />);
    expect(screen.getByRole('status', { name: 'Chargement…' })).toBeInTheDocument();
  });

  it('clears cache and keeps a visible success notification translated after switching language', async () => {
    cacheFaction(2);
    render(
      <>
        <Settings />
        <ToastContainer />
      </>,
      { wrapper: TestWrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear offline cache' }));
    expect(await screen.findByText('Offline cache cleared')).toBeInTheDocument();
    expect(clearOfflineData).toHaveBeenCalledOnce();
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByText('Cache hors ligne vidé')).toBeInTheDocument();
    expect(
      screen.getByText('Les packs de factions et les fiches en cache ont été supprimés.')
    ).toBeInTheDocument();
  });

  it.each(['en', 'fr'])('translates cache errors in %s', async (language) => {
    cacheFaction(1);
    clearOfflineData.mockRejectedValueOnce(new Error('storage unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await i18n.changeLanguage(language);
    render(
      <>
        <Settings />
        <ToastContainer />
      </>,
      { wrapper: TestWrapper }
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: language === 'fr' ? 'Vider le cache hors ligne' : 'Clear offline cache'
      })
    );
    expect(
      await screen.findByText(
        language === 'fr'
          ? 'Impossible de vider le cache hors ligne.'
          : 'Failed to clear the offline cache.'
      )
    ).toBeInTheDocument();
  });

  it.each(['en', 'fr'])('translates save errors in %s', async (language) => {
    updateSettings.mockRejectedValueOnce(new Error('storage unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await i18n.changeLanguage(language);
    render(
      <>
        <Settings />
        <ToastContainer />
      </>,
      { wrapper: TestWrapper }
    );
    fireEvent.click(screen.getByRole('radio', { name: language === 'fr' ? 'Clair' : 'light' }));
    expect(updateSettings).toHaveBeenCalledWith({ theme: 'light' });
    expect(
      await screen.findByText(
        language === 'fr' ? 'Impossible d’enregistrer les paramètres.' : 'Failed to save settings.'
      )
    ).toBeInTheDocument();
  });
});
