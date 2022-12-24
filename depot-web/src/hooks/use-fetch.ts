import { useState, useEffect } from 'react';

const useFetch = <T>(url: string, skip = false) => {
  const [shouldFetch, setShouldFetch] = useState(!skip);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false);
      setData(undefined);
      setError(undefined);

      fetch(url)
        .then((r) => r.json())
        .then((d) => setData(d as T))
        .catch((e) => setError(e));
    }
  }, [shouldFetch, setShouldFetch, setData, setError]);

  return {
    data,
    error,
    loading: !data && !error,
    refetch: () => {
      setShouldFetch(true);
    }
  };
};

export default useFetch;
