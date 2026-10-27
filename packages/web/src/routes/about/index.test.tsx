import { act, render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import About from '.';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

it('translates the mounted page and title while preserving attribution and links', async () => {
  render(
    <TestWrapper>
      <About />
    </TestWrapper>
  );
  expect(screen.getByRole('heading', { name: 'About depot' })).toBeInTheDocument();
  await act(() => i18n.changeLanguage('fr'));
  expect(screen.getByRole('heading', { name: 'À propos de depot' })).toBeInTheDocument();
  expect(document.title).toBe('À propos de depot');
  expect(screen.getByText(/Je suis Francois/)).toHaveTextContent(
    'Catachan Jungle Fighters Battle Force'
  );
  expect(screen.getByRole('link', { name: 'Voir le dépôt GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/fjlaubscher/depot'
  );
  expect(screen.getByRole('link', { name: 'francoisjlaubscher@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:francoisjlaubscher@gmail.com'
  );
});
