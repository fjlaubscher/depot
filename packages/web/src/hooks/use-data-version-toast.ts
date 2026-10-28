import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/contexts/toast/context';

/**
 * Announces a background rules-data sync. Only fires when the version actually
 * changes under us — the first version seen in a session is the baseline.
 */
const useDataVersionToast = (dataVersion: string | null | undefined) => {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    if (!dataVersion) return;

    if (seen.current && seen.current !== dataVersion) {
      showToast({
        type: 'success',
        title: t('data.updated'),
        message: t('data.nowOn', { version: dataVersion }),
        translation: {
          title: 'data.updated',
          message: 'data.nowOn',
          values: { version: dataVersion }
        }
      });
    }
    seen.current = dataVersion;
  }, [dataVersion, showToast, t]);
};

export default useDataVersionToast;
