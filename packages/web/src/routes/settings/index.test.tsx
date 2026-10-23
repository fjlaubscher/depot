import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import { offlineStorage } from '@/data/offline-storage';
import i18n from '@/i18n';
import Settings from './index';

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
    ).toEqual(['Automatic', 'Français', 'English']);
    select.focus();
    expect(select).toHaveFocus();

    fireEvent.change(select, { target: { value: 'fr' } });
    await screen.findByRole('combobox', { name: 'Langue de l’interface' });
    expect(within(select).getByRole('option', { name: 'Automatique' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('fr');
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
