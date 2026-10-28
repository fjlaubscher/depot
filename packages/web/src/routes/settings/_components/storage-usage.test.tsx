import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import i18n from '@/i18n';
import StorageUsage from './storage-usage';

afterEach(() => vi.unstubAllGlobals());

describe('StorageUsage', () => {
  it('formats quota numbers and labels in the effective language', async () => {
    vi.stubGlobal('navigator', {
      storage: { estimate: async () => ({ usage: 1.5 * 1024 ** 2, quota: 10 * 1024 ** 2 }) }
    });
    render(<StorageUsage />);
    expect(await screen.findByRole('progressbar', { name: 'Storage used' })).toHaveAttribute(
      'aria-valuenow',
      '15'
    );
    expect(screen.getByTestId('storage-usage')).toHaveTextContent(
      '1.5 MB used of 10.0 MB available'
    );
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByRole('progressbar', { name: 'Stockage utilisé' })).toHaveAttribute(
      'aria-valuenow',
      '15'
    );
    expect(screen.getByTestId('storage-usage')).toHaveTextContent(
      '1,5 Mo utilisés sur 10,0 Mo disponibles'
    );
  });

  it.each(['en', 'fr'])('handles an unknown quota in %s', async (language) => {
    vi.stubGlobal('navigator', { storage: { estimate: async () => ({ usage: 1024 ** 2 }) } });
    await i18n.changeLanguage(language);
    render(<StorageUsage />);
    await screen.findByRole('progressbar');
    expect(screen.getByTestId('storage-usage')).toHaveTextContent(
      language === 'fr' ? '1,0 Mo utilisés' : '1.0 MB used'
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it.each(['missing', 'rejected'])('translates an unavailable estimate (%s)', async (mode) => {
    vi.stubGlobal('navigator', {
      storage:
        mode === 'missing'
          ? undefined
          : { estimate: vi.fn().mockRejectedValue(new Error('unavailable')) }
    });
    render(<StorageUsage />);
    expect(screen.getByTestId('storage-usage')).toHaveTextContent('Storage estimate unavailable');
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByTestId('storage-usage')).toHaveTextContent(
      'Estimation du stockage indisponible'
    );
  });
});
