import { useEffect, useRef } from 'react';

import { useToast } from '@/contexts/toast/context';

/**
 * Announces a background rules-data sync. Only fires when the version actually
 * changes under us — the first version seen in a session is the baseline.
 */
const useDataVersionToast = (dataVersion: string | null | undefined) => {
  const { showToast } = useToast();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    if (!dataVersion) return;

    if (seen.current && seen.current !== dataVersion) {
      showToast({
        type: 'success',
        title: 'Rules data updated',
        message: `Now on ${dataVersion}.`
      });
    }
    seen.current = dataVersion;
  }, [dataVersion, showToast]);
};

export default useDataVersionToast;
