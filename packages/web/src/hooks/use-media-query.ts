import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** Reactive `window.matchMedia` — false in non-browser/test envs without matchMedia. */
const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return noop();
      const mql = window.matchMedia(query);
      mql.addEventListener?.('change', onChange);
      return () => mql.removeEventListener?.('change', onChange);
    },
    () =>
      typeof window !== 'undefined' && !!window.matchMedia && !!window.matchMedia(query)?.matches,
    () => false
  );

export default useMediaQuery;
