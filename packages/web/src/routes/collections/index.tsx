import React from 'react';

import AppLayout from '@/components/layout';
import CollectionsPanel from '@/routes/collections/_components/collections-panel';

const CollectionsPage: React.FC = () => (
  <CollectionsPanel>
    {({ toolbar, body }) => (
      <AppLayout
        title="Collections"
        heading={{ title: 'Collections', subtitle: 'Owned models and paint state' }}
        crumbs={[{ label: 'Armies', to: '/armies' }, { label: 'Collections' }]}
        toolbar={toolbar}
      >
        {body}
      </AppLayout>
    )}
  </CollectionsPanel>
);

export default CollectionsPage;
