import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Plus, Pencil } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/context';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Grid } from '@/components/ui';
import { BackButton } from '@/components/shared';
import {
  RosterHeader,
  RosterSection,
  RosterUnitCardEdit,
  RosterEmptyState
} from '@/components/shared/roster';
import { getRosterSubtitle } from '@depot/core/utils/roster';
import RosterIssues from '@/routes/rosters/_components/roster-issues';

const RosterEdit: FC = () => {
  const { state: roster, duplicateUnit, removeUnit } = useRoster();
  const navigate = useNavigate();

  const sortedUnits = [...roster.units].sort((a, b) =>
    a.datasheet.name.localeCompare(b.datasheet.name)
  );

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
        subtitle={getRosterSubtitle(roster)}
        action={{
          icon: <Pencil size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}/details`),
          ariaLabel: 'Edit roster details'
        }}
      />

      {/* Desktop splits list from budget: the points bar stays put while the list scrolls */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <aside className="order-first flex flex-col gap-4 lg:order-last lg:sticky lg:top-4">
          <div className="surface-card p-3">
            <RosterHeader roster={roster} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={() => navigate(`/rosters/${roster.id}/add-units`)}
              className="flex-1"
              data-testid="add-units-button"
            >
              <Plus size={16} />
              Add Units
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/rosters/${roster.id}`)}
              className="flex-1"
              data-testid="view-roster-button"
            >
              <Eye size={16} />
              View Roster
            </Button>
          </div>

          <RosterIssues roster={roster} />
        </aside>

        <div className="min-w-0">
          {roster.units.length > 0 ? (
            <RosterSection
              title={`Units (${sortedUnits.length})`}
              data-testid="roster-units-section"
            >
              <Grid cols={2}>
                {sortedUnits.map((unit) => (
                  <RosterUnitCardEdit
                    key={unit.id}
                    unit={unit}
                    rosterId={roster.id}
                    onRemove={removeUnit}
                    onDuplicate={duplicateUnit}
                    dataTestId={`roster-unit-card-${unit.datasheet.slug}`}
                  />
                ))}
              </Grid>
            </RosterSection>
          ) : (
            <RosterEmptyState
              title="No units in this roster"
              dataTestId="empty-roster-state"
              action={{
                label: 'Add units',
                onClick: () => navigate(`/rosters/${roster.id}/add-units`),
                icon: <Plus size={14} />,
                testId: 'empty-roster-add-units'
              }}
            />
          )}
        </div>
      </div>
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
