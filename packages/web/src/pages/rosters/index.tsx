import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import useRosters from '@/hooks/use-rosters';

import AppLayout from '@/components/layout';
import { PageHeader, LinkCard, Loader, ErrorState } from '@/components/ui';

const Rosters: React.FC = () => {
  const navigate = useNavigate();
  const { rosters, loading, error } = useRosters();

  const handleCreate = () => {
    navigate('/rosters/create');
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
            <p className="text-gray-500 dark:text-gray-400">You haven't created any rosters yet.</p>
          </div>
        ) : (
          <div
            data-testid="rosters-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {rosters.map((roster) => (
              <LinkCard
                key={roster.id}
                to={roster.points.current ? `/rosters/${roster.id}/edit` : `/rosters/${roster.id}`}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {roster.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{`${roster.points.current} / ${roster.points.max} pts`}</p>
                </div>
              </LinkCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Rosters;
