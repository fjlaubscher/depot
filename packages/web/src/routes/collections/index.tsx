import React from 'react';

import AppLayout from '@/components/layout';
import CollectionsPanel from '@/routes/collections/_components/collections-panel';

const CollectionsPage: React.FC = () => (
  <AppLayout title="Collections">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Collections</h1>
        <p className="mt-0.5 font-mono text-[10px] font-medium uppercase text-muted">
          Owned models and paint state
        </p>
      </div>
      <CollectionsPanel />
    </div>
  </AppLayout>
);

export default CollectionsPage;
