import { useMemo, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Plus, Pencil } from 'lucide-react';
import type { depot } from '@depot/core';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/context';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';

import AppLayout from '@/components/layout';
import { Button, Loader } from '@/components/ui';
import {
  RosterHeader,
  RosterSection,
  RosterUnitCardEdit,
  RosterEmptyState
} from '@/components/shared/roster';
import { getRosterSubtitle } from '@depot/core/utils/roster';
import { validateRoster } from '@depot/core/utils/roster-legality';
import {
  BATTLEFIELD_ROLES,
  BATTLEFIELD_ROLE_LABELS,
  getBattlefieldRole
} from '@depot/core/utils/datasheets';
import RosterIssues from '@/routes/rosters/_components/roster-issues';

const unitPoints = (unit: depot.RosterUnit) => parseInt(unit.modelCost.cost, 10) || 0;

const RosterEdit: FC = () => {
  const { state: roster, duplicateUnit, removeUnit } = useRoster();
  const navigate = useNavigate();

  /** Sections by battlefield role, mirroring how a list is written out. */
  const sections = useMemo(() => {
    const byRole = new Map<string, depot.RosterUnit[]>();
    for (const unit of roster.units) {
      const role = getBattlefieldRole(unit.datasheet);
      byRole.set(role, [...(byRole.get(role) ?? []), unit]);
    }
    return BATTLEFIELD_ROLES.filter((role) => byRole.has(role)).map((role) => {
      const units = [...byRole.get(role)!].sort((a, b) =>
        a.datasheet.name.localeCompare(b.datasheet.name)
      );
      return {
        role,
        units,
        points: units.reduce((total, unit) => total + unitPoints(unit), 0)
      };
    });
  }, [roster.units]);

  // Same unit badges as the view roster: warlord, enhancement, unit-scoped legality.
  const issuesByUnit = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const issue of validateRoster(roster)) {
      if (!issue.unitId) continue;
      map.set(issue.unitId, [...(map.get(issue.unitId) ?? []), issue.message]);
    }
    return map;
  }, [roster]);

  const enhancementsByUnit = useMemo(
    () => new Map(roster.enhancements.map((entry) => [entry.unitId, entry.enhancement.name])),
    [roster.enhancements]
  );

  useScrollToHash({ enabled: Boolean(roster.id) });

  if (!roster.id) {
    return (
      <AppLayout title="Manage Roster Units" back={{ to: '/rosters', label: 'Rosters' }}>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`${roster.name} - Manage Roster Units`}
      back={{ to: '/rosters', label: 'Rosters' }}
      heading={{ title: roster.name, subtitle: getRosterSubtitle(roster) }}
      actions={[
        {
          icon: <Pencil size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}/details`),
          ariaLabel: 'Edit roster details'
        },
        {
          icon: <Eye size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}`),
          ariaLabel: 'View roster',
          'data-testid': 'view-roster-button'
        }
      ]}
      footer={
        <Button
          fullWidth
          onClick={() => navigate(`/rosters/${roster.id}/add-units`)}
          data-testid="add-units-button"
        >
          <Plus size={16} />
          Add units
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {/* The budget bar is the thing you check between every edit — it stays at the top. */}
        <div className="surface-card p-3 lg:sticky lg:top-0 lg:z-10">
          <RosterHeader roster={roster} />
        </div>

        <RosterIssues roster={roster} />

        {sections.length > 0 ? (
          sections.map(({ role, units, points }) => (
            <RosterSection
              key={role}
              title={BATTLEFIELD_ROLE_LABELS[role]}
              count={`${units.length} · ${points} PTS`}
              data-testid={`roster-units-${role}`}
            >
              <div className="grid gap-1 lg:grid-cols-2">
                {units.map((unit) => (
                  <RosterUnitCardEdit
                    key={unit.id}
                    unit={unit}
                    rosterId={roster.id}
                    onRemove={removeUnit}
                    onDuplicate={duplicateUnit}
                    dataTestId={`roster-unit-card-${unit.datasheet.slug}`}
                    isWarlord={roster.warlordUnitId === unit.id}
                    enhancementName={enhancementsByUnit.get(unit.id)}
                    issues={issuesByUnit.get(unit.id)}
                  />
                ))}
              </div>
            </RosterSection>
          ))
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
    </AppLayout>
  );
};

const RosterPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <RosterProvider rosterId={rosterId}>
      <RosterEdit />
    </RosterProvider>
  );
};

export default RosterPage;
