import { useEffect, useState } from 'react';

/** `navigator.onLine`, kept live. Defaults to online where the API is missing. */
const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState(() => navigator.onLine ?? true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return online;
};

export default useOnlineStatus;
