import { useEffect, useState } from 'react';

const useAsync = <T>(promise: () => Promise<T>, triggerOnMount = true) => {
  const [shouldTrigger, setShouldTrigger] = useState(triggerOnMount);
  const [value, setValue] = useState<T | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shouldTrigger) {
      setShouldTrigger(false);

      promise()
        .then(setValue)
        .catch((e: any) => setError(e.message || 'Unknown error'));
    }
  }, [shouldTrigger, setShouldTrigger, promise]);

  return {
    loading: !value && !error,
    value,
    error,
    trigger: () => setShouldTrigger(true)
  };
};

export default useAsync;
