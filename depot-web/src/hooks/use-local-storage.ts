import { useCallback, useState } from 'react';

const useLocalStorage = <T>(key: string): [T | undefined, (data: T) => void] => {
  const storedJSON = localStorage.getItem(`depot-${key}`);
  const parsed = storedJSON ? JSON.parse(storedJSON) : undefined;
  const [data, setData] = useState<T | undefined>(parsed);

  const storeAndSetData = useCallback(
    (data: T) => {
      setData(data);
      localStorage.setItem(`depot-${key}`, JSON.stringify(data));
    },
    [setData]
  );

  return [data, storeAndSetData];
};

export default useLocalStorage;
