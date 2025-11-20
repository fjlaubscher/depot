import React from 'react';
import AppLayout from '@/components/layout';
import { Skeleton as UISkeleton, TabsSkeleton } from '@/components/ui';

const PillRow: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    {[96, 110, 84].map((width, idx) => (
      <UISkeleton key={idx} width={width} height={22} className="rounded-full" />
    ))}
  </div>
);

const DatasheetSkeleton: React.FC = () => {
  return (
    <AppLayout title="Datasheet">
      <div className="flex flex-col gap-4" data-testid="datasheet-loader">
        <UISkeleton width="70%" height={28} className="rounded-md" />
        <UISkeleton width="45%" height={14} className="rounded-md" />

        <TabsSkeleton tabCount={2} />

        <div className="surface-card p-4 rounded-md flex flex-col gap-2">
          <UISkeleton width="100%" height={12} className="rounded-md" />
          <UISkeleton width="95%" height={12} className="rounded-md" />
          <UISkeleton width="88%" height={12} className="rounded-md" />
          <UISkeleton width="92%" height={12} className="rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <UISkeleton width="30%" height={14} className="rounded-md" />
          <PillRow />
        </div>

        <div className="flex flex-col gap-2">
          <UISkeleton width="32%" height={14} className="rounded-md" />
          <PillRow />
        </div>
      </div>
    </AppLayout>
  );
};

export default DatasheetSkeleton;
