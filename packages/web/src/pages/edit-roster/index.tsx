import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import { Eye, Plus } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button } from '@/components/ui';
import { BackButton } from '@/components/shared';
import { RosterHeader, RosterSection, RosterUnitCardEdit } from '@/components/shared/roster';
import { groupRosterUnitsByRole } from '@/utils/roster';

const RosterView: FC = () => {
  const { state: roster, duplicateUnit, removeUnit } = useRoster();
  const { state: appState } = useAppContext();
  const navigate = useNavigate();

  const groupedUnits = groupRosterUnitsByRole(roster.units);
  const roleKeys = Object.keys(groupedUnits).sort();

  if (!roster.id) {
    return <Loader />;
  }

  const factionName = appState.factionIndex?.find(
    (f: depot.Index) => f.slug === roster.factionSlug || f.id === roster.factionId
  )?.name;

  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName || roster.factionSlug || roster.factionId;

  const handleViewRoster = () => {
    navigate(`/rosters/${roster.id}`);
  };

  const handleAddUnits = () => {
    navigate(`/rosters/${roster.id}/add-units`);
  };

  return (
    <div className="flex flex-col gap-4">
      <BackButton to="/rosters" label="Rosters" ariaLabel="Back to Rosters" className="md:hidden" />

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` }
          ]}
        />
      </div>

      <PageHeader
        title={roster.name}
        subtitle={subtitle}
        stats={<RosterHeader roster={roster} />}
        action={{
          icon: <Eye size={16} />,
          onClick: handleViewRoster,
          ariaLabel: 'View roster'
        }}
      />

      <Button
        onClick={handleAddUnits}
        className="w-full flex items-center gap-2"
        data-testid="add-units-button"
      >
        <Plus size={16} />
        Add Units to Roster
      </Button>

      {/* Units List */}
      {roster.units.length > 0 ? (
        <div className="flex flex-col gap-4">
          {roleKeys.map((role) => (
            <RosterSection
              key={role}
              title={`${role.toUpperCase()} (${groupedUnits[role].length})`}
              data-testid="unit-role-section"
            >
              {groupedUnits[role].map((unit) => (
                <RosterUnitCardEdit
                  key={unit.id}
                  unit={unit}
                  rosterId={roster.id}
                  onRemove={removeUnit}
                  onDuplicate={duplicateUnit}
                />
              ))}
            </RosterSection>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
          data-testid="empty-roster-state"
        >
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No units in this roster</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Add units to start building your roster
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const RosterPage: FC = () => {
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
