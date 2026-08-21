import type { depot } from '@depot/core';

export const THEME_STORAGE_KEY = 'depot-theme';

/**
 * Applies the resolved theme as a `.dark` class on <html> and mirrors the
 * choice to localStorage so the inline script in index.html can restore it
 * synchronously on the next load (settings themselves live in IndexedDB,
 * which resolves too late to avoid a flash).
 */
export const applyTheme = (theme: depot.Theme) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // private mode / storage disabled — the class is still applied for this session
  }
};
