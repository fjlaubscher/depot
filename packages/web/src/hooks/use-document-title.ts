import { useEffect } from 'react';

const APP_NAME = 'depot';

export const formatDocumentTitle = (value?: string): string => {
  const trimmed = (value ?? '').trim();
  if (!trimmed.length) {
    return APP_NAME;
  }

  const normalized = trimmed.toLowerCase();
  return normalized.includes(APP_NAME) ? trimmed : `${trimmed} | ${APP_NAME}`;
};

/**
 * Custom hook to set document title
 * Replaces react-helmet for simple title management
 */
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = formatDocumentTitle(title);
  }, [title]);
};
