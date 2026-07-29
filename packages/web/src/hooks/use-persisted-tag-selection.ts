import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'depot:tag-selection:';

export const usePersistedTagSelection = <T extends string>(
  key: string,
  defaultValue: T,
  isValid?: (value: T) => boolean
) => {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const [selection, setSelection] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(storageKey) as T | null;
      if (stored && (!isValid || isValid(stored))) {
        return stored;
      }
    } catch {
      // localStorage unavailable; fall through to default
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (isValid && !isValid(selection)) {
        setSelection(defaultValue);
        return;
      }
      window.localStorage.setItem(storageKey, selection);
    } catch {
      // localStorage unavailable; selection stays in-memory only
    }
  }, [defaultValue, isValid, storageKey, selection]);

  const clearSelection = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // localStorage unavailable
    }
    setSelection(defaultValue);
  };

  return { selection, setSelection, clearSelection } as const;
};

export default usePersistedTagSelection;
