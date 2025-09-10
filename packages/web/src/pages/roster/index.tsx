import React from 'react';
import { useParams } from 'react-router-dom';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader } from '@/components/ui';

const RosterView: React.FC = () => {
  const { state: roster } = useRoster();

  if (!roster.id) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={roster.name}
        subtitle={`${roster.points.current} / ${roster.points.max} pts`}
      />
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Roster building interface will go here.</p>
      </div>
    </div>
  );
};

const RosterPage: React.FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Roster">
      <RosterProvider rosterId={rosterId}>
        <RosterView />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterPage;
