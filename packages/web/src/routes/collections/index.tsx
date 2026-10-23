import React from 'react';
import { useTranslation } from 'react-i18next';

import AppLayout from '@/components/layout';
import CollectionsPanel from '@/routes/collections/_components/collections-panel';

const CollectionsPage: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <CollectionsPanel>
      {({ toolbar, body }) => (
        <AppLayout
          title={t('navigation.collections')}
          heading={{ title: t('navigation.collections'), subtitle: 'Owned models and paint state' }}
          crumbs={[
            { label: t('navigation.armies'), to: '/armies' },
            { label: t('navigation.collections') }
          ]}
          toolbar={toolbar}
        >
          {body}
        </AppLayout>
      )}
    </CollectionsPanel>
  );
};

export default CollectionsPage;
