import React from 'react';
import type { FC, ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

import { Card, Button } from '@/components/ui';

interface ListEmptyStateProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  testId?: string;
}

const ListEmptyState: FC<ListEmptyStateProps> = ({
  title,
  actionLabel,
  onAction,
  icon,
  testId
}) => (
  <Card className="flex flex-col items-center gap-3 py-10" data-testid={testId}>
    {icon ?? <FolderOpen className="h-8 w-8 text-muted" />}
    <p className="text-base font-semibold text-foreground text-center">{title}</p>
    {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
  </Card>
);

export default ListEmptyState;
