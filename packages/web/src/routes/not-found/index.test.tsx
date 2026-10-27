import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import NotFound from '.';

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

it('translates the mounted error page, document title and working recovery action', async () => {
  const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
  render(
    <TestWrapper>
      <NotFound />
    </TestWrapper>
  );
  expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
  await act(() => i18n.changeLanguage('fr'));
  expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
  expect(document.title).toBe('Page introuvable | depot');
  expect(screen.getByText(/déplacée, supprimée ou n’existe pas/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retour à l’accueil' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revenir en arrière' }));
  expect(back).toHaveBeenCalledOnce();
  back.mockRestore();
});
