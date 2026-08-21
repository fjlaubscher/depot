import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseScrollToHashOptions {
  enabled?: boolean;
}

/** Scrolls the `#hash` target into view once its content is ready; `:target` CSS handles the highlight. */
export const useScrollToHash = ({ enabled = true }: UseScrollToHashOptions = {}) => {
  const location = useLocation();

  useEffect(() => {
    if (!enabled || !location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;

    const timeout = window.setTimeout(() => target.scrollIntoView({ block: 'start' }), 0);
    return () => window.clearTimeout(timeout);
  }, [location.hash, enabled]);
};
