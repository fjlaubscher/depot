import { useEffect } from 'react';

/**
 * Custom hook to set document title
 * Replaces react-helmet for simple title management
 */
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};