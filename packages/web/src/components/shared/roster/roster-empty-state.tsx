import React, { type FC, type ReactNode } from 'react';

import { Button } from '@/components/ui';

interface RosterEmptyStateProps {
  title: string;
  description?: string;
  dataTestId?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    testId?: string;
  };
}

const RosterEmptyState: FC<RosterEmptyStateProps> = ({
  title,
  description,
  dataTestId,
  action
}) => (
  <div
    className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-700"
    data-testid={dataTestId}
  >
    <div className="flex flex-col gap-2">
      <p className="text-lg text-subtle">{title}</p>
      {description ? <p className="text-sm text-hint">{description}</p> : null}
    </div>
    {action ? (
      <Button onClick={action.onClick} data-testid={action.testId} className="inline-flex gap-2">
        {action.icon}
        {action.label}
      </Button>
    ) : null}
  </div>
);

export default RosterEmptyState;
