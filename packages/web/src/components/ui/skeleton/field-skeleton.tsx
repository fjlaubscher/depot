import type { FC } from 'react';
import classNames from 'classnames';
import { Skeleton } from './skeleton';

export const FieldSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('flex flex-col gap-2', className)} data-testid="field-skeleton">
    <Skeleton height={16} width="30%" />
    <Skeleton height={40} width="100%" variant="rounded" />
  </div>
);
