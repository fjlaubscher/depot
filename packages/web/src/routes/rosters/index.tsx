import React from 'react';
import { useTranslation } from 'react-i18next';

import AppLayout from '@/components/layout';
import ListsPanel from '@/routes/rosters/_components/lists-panel';

const Rosters: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <ListsPanel>
      {({ toolbar, body }) => (
        <AppLayout
          title={t('navigation.rosters')}
          heading={{ title: t('navigation.rosters'), subtitle: 'Lists for the table' }}
          crumbs={[
            { label: t('navigation.armies'), to: '/armies' },
            { label: t('navigation.rosters') }
          ]}
          toolbar={toolbar}
        >
          {body}
        </AppLayout>
      )}
    </ListsPanel>
  );
};

export default Rosters;
