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
    if (isValid && !isValid(selection)) {
      setSelection(defaultValue);
      return;
    }
    try {
      window.localStorage.setItem(storageKey, selection);
    } catch {
      // localStorage unavailable; selection stays in-memory only
    }
  }, [defaultValue, isValid, storageKey, selection]);

  return { selection, setSelection, clearSelection: () => setSelection(defaultValue) } as const;
};

export default usePersistedTagSelection;
