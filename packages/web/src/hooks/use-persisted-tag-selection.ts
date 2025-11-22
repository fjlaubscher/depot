import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'depot:tag-selection:';

const isStorageAvailable = () => typeof window !== 'undefined' && !!window.localStorage;

const buildStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

export const persistTagSelection = <T extends string>(key: string, value: T) => {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.setItem(buildStorageKey(key), value);
};

export const readTagSelection = <T extends string>(key: string): T | null => {
  if (!isStorageAvailable()) {
    return null;
  }

  return window.localStorage.getItem(buildStorageKey(key)) as T | null;
};

export const clearTagSelection = (key: string) => {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(buildStorageKey(key));
};

export const usePersistedTagSelection = <T extends string>(
  key: string,
  defaultValue: T,
  isValid?: (value: T) => boolean
) => {
  const [selection, setSelection] = useState<T>(() => {
    const stored = readTagSelection<T>(key);

    if (stored && (!isValid || isValid(stored))) {
      return stored;
    }

    return defaultValue;
  });

  useEffect(() => {
    if (isValid && !isValid(selection)) {
      setSelection(defaultValue);
      return;
    }

    persistTagSelection(key, selection);
  }, [defaultValue, isValid, key, selection]);

  const clearSelection = () => {
    clearTagSelection(key);
    setSelection(defaultValue);
  };

  return { selection, setSelection, clearSelection } as const;
};

export default usePersistedTagSelection;
