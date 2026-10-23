import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useFactionsContext } from '@/contexts/factions/context';
import { cx } from '@/utils/cx';

interface Props {
  className?: string;
  'data-testid'?: string;
}

/**
 * Names the source rather than showing a bare timestamp: every rule in the app
 * comes from a Wahapedia export, and this is the date that export was taken.
 */
const DataVersion: FC<Props> = ({ className, 'data-testid': testId }) => {
  const { t } = useTranslation('common');
  const { dataVersion } = useFactionsContext();

  return (
    <p
      className={cx('font-mono text-[9.5px] font-medium uppercase text-hint', className)}
      data-testid={testId}
    >
      {t('data.source')} · {dataVersion?.split(' ')[0] ?? t('data.notSynced')}
    </p>
  );
};

export default DataVersion;
