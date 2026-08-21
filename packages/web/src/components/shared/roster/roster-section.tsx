import type { FC, ReactNode } from 'react';

import { SectionHeader } from '@/components/ui';
import { cx } from '@/utils/cx';

interface RosterSectionProps {
  title: string;
  /** Right-hand meta on the rule — e.g. `3 · 195 PTS`. */
  count?: ReactNode;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  belowContent?: ReactNode;
}

const RosterSection: FC<RosterSectionProps> = ({
  title,
  count,
  children,
  className,
  'data-testid': dataTestId,
  belowContent
}) => (
  <div className={cx('flex flex-col gap-1.5', className)} data-testid={dataTestId}>
    <SectionHeader title={title} count={count} />
    {belowContent ? <div className="flex flex-col gap-2">{belowContent}</div> : null}
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

export default RosterSection;
