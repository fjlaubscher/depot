import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseScrollToHashOptions {
  enabled?: boolean;
}

export const useScrollToHash = ({ enabled = true }: UseScrollToHashOptions = {}) => {
  const location = useLocation();

  useEffect(() => {
    let scrollTimeout: number | undefined;
    let highlightTimeout: number | undefined;

    if (!enabled) return;
    if (!location.hash) return;

    const id = location.hash.slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    scrollTimeout = window.setTimeout(() => {
      target.scrollIntoView({ block: 'start' });
      target.setAttribute('data-scroll-highlight', 'true');
      highlightTimeout = window.setTimeout(() => {
        target.removeAttribute('data-scroll-highlight');
      }, 1600);
    }, 0);

    return () => {
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
      if (highlightTimeout) {
        window.clearTimeout(highlightTimeout);
      }
    };
  }, [location.hash, enabled]);
};
