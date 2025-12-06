import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Plus, Pencil } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button } from '@/components/ui';
import { BackButton } from '@/components/shared';
import {
  RosterHeader,
  RosterSection,
  RosterUnitCardEdit,
  RosterEmptyState,
  RosterUnitGrid
} from '@/components/shared/roster';
import { getRosterFactionName, groupRosterUnitsByRole } from '@/utils/roster';

const RosterEdit: FC = () => {
  const { state: roster, duplicateUnit, removeUnit } = useRoster();
  const navigate = useNavigate();

  const groupedUnits = groupRosterUnitsByRole(roster.units);
  const roleKeys = Object.keys(groupedUnits).sort();

  useDocumentTitle(roster.id ? `${roster.name} - Manage Roster Units` : 'Manage Roster Units');
  useScrollToHash({ enabled: Boolean(roster.id) });

  if (!roster.id) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton
          to="/rosters"
          label="Rosters"
          ariaLabel="Back to Rosters"
          className="md:hidden"
        />
        <Loader />
      </div>
    );
  }

  const factionName = getRosterFactionName(roster);

  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName;

  const handleViewRoster = () => {
    navigate(`/rosters/${roster.id}`);
  };

  const handleEditDetails = () => {
    navigate(`/rosters/${roster.id}/details`);
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
          icon: <Pencil size={16} />,
          onClick: handleEditDetails,
          ariaLabel: 'Edit roster details'
        }}
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleAddUnits}
            className="flex items-center gap-2"
            data-testid="add-units-button"
          >
            <Plus size={16} />
            Add Units
          </Button>
          <Button
            variant="secondary"
            onClick={handleViewRoster}
            className="flex items-center gap-2"
            data-testid="view-roster-button"
          >
            <Eye size={16} />
            View Roster
          </Button>
        </div>
      </div>

      {/* Units List */}
      {roster.units.length > 0 ? (
        <div className="flex flex-col gap-4">
          {roleKeys.map((role) => (
            <RosterSection
              key={role}
              title={`${role.toUpperCase()} (${groupedUnits[role].length})`}
              data-testid="unit-role-section"
            >
              <RosterUnitGrid>
                {groupedUnits[role].map((unit) => (
                  <RosterUnitCardEdit
                    key={unit.id}
                    unit={unit}
                    rosterId={roster.id}
                    onRemove={removeUnit}
                    onDuplicate={duplicateUnit}
                    dataTestId={`roster-unit-card-${unit.datasheet.slug}`}
                  />
                ))}
              </RosterUnitGrid>
            </RosterSection>
          ))}
        </div>
      ) : (
        <RosterEmptyState
          title="No units in this roster"
          dataTestId="empty-roster-state"
          action={{
            label: 'Add units',
            onClick: handleAddUnits,
            icon: <Plus size={14} />,
            testId: 'empty-roster-add-units'
          }}
        />
      )}
    </div>
  );
};

const RosterPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Manage Roster Units">
      <RosterProvider rosterId={rosterId}>
        <RosterEdit />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterPage;
