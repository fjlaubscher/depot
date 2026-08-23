import React from 'react';

import AppLayout from '@/components/layout';
import ListsPanel from '@/routes/rosters/_components/lists-panel';

const Rosters: React.FC = () => (
  <AppLayout title="Rosters">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rosters</h1>
        <p className="mt-0.5 font-mono text-[10px] font-medium uppercase text-muted">
          Lists for the table
        </p>
      </div>
      <ListsPanel />
    </div>
  </AppLayout>
);

export default Rosters;
