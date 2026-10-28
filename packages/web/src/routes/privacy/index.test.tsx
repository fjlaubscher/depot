import { act, render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import Privacy from '.';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

it('translates privacy commitments, inline links and document title without changing the effective date', async () => {
  render(
    <TestWrapper>
      <Privacy />
    </TestWrapper>
  );
  expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
  await act(() => i18n.changeLanguage('fr'));
  expect(screen.getByRole('heading', { name: 'Politique de confidentialité' })).toBeInTheDocument();
  expect(document.title).toBe('Politique de confidentialité | depot');
  expect(screen.getByText(/Aucun de ces contenus/)).toBeInTheDocument();
  expect(screen.getByText(/90 jours/)).toBeInTheDocument();
  expect(screen.getByText(/25 novembre 2025/)).toBeInTheDocument();
  expect(screen.getByText('*.ingest.sentry.io').tagName).toBe('CODE');
  expect(screen.getByRole('link', { name: 'Sentry' })).toHaveAttribute('href', 'https://sentry.io');
  expect(screen.getByRole('link', { name: 'francoisjlaubscher@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:francoisjlaubscher@gmail.com'
  );
});
