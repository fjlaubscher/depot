import type { FC } from 'react';

import { APP_VERSION } from '@/constants/app';
import { cx } from '@/utils/cx';

interface Props {
  className?: string;
}

const AppVersion: FC<Props> = ({ className }) => (
  <p
    className={cx('font-mono text-[9.5px] font-medium uppercase text-hint', className)}
    data-testid="app-version"
  >
    depot · {APP_VERSION}
  </p>
);

export default AppVersion;
