import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import useRosters from '@/hooks/use-rosters';
import { useToast } from '@/contexts/toast/use-toast-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, ErrorState } from '@/components/ui';
import { RosterCard } from './_components/roster-card';

const Rosters: React.FC = () => {
  const navigate = useNavigate();
  const { rosters, loading, error, deleteRoster } = useRosters();
  const { showToast } = useToast();

  const handleCreate = () => {
    navigate('/rosters/create');
  };

  const handleDeleteRoster = async (rosterId: string) => {
    try {
      await deleteRoster(rosterId);
      showToast({
        type: 'success',
        title: 'Roster Deleted',
        message: 'The roster has been successfully deleted.'
      });
    } catch (error) {
      console.error('Failed to delete roster:', error);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the roster. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Rosters">
        <div className="flex flex-col gap-4">
          <PageHeader
            title="My Rosters"
            subtitle="Manage your army rosters"
            action={{
              icon: <Plus size={16} />,
              onClick: handleCreate,
              ariaLabel: 'Create new roster'
            }}
          />
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="My Rosters">
        <div className="flex flex-col gap-4">
          <PageHeader
            title="My Rosters"
            subtitle="Manage your army rosters"
            action={{
              icon: <Plus size={16} />,
              onClick: handleCreate,
              ariaLabel: 'Create new roster'
            }}
          />
          <ErrorState title="Failed to load rosters" message={error} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Rosters">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="My Rosters"
          subtitle="Manage your army rosters"
          action={{
            icon: <Plus size={16} />,
            onClick: handleCreate,
            ariaLabel: 'Create new roster'
          }}
        />
        {rosters.length === 0 ? (
          <div
            data-testid="empty-state"
            className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <p className="text-subtle">You haven't created any rosters yet.</p>
          </div>
        ) : (
          <div
            data-testid="rosters-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {rosters.map((roster) => (
              <RosterCard key={roster.id} roster={roster} onDelete={handleDeleteRoster} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Rosters;
