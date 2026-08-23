import React from 'react';

import AppLayout from '@/components/layout';
import ListsPanel from '@/routes/rosters/_components/lists-panel';

const Rosters: React.FC = () => (
  <ListsPanel>
    {({ toolbar, body }) => (
      <AppLayout
        title="Rosters"
        heading={{ title: 'Rosters', subtitle: 'Lists for the table' }}
        crumbs={[{ label: 'Armies', to: '/armies' }, { label: 'Rosters' }]}
        toolbar={toolbar}
      >
        {body}
      </AppLayout>
    )}
  </ListsPanel>
);

export default Rosters;
