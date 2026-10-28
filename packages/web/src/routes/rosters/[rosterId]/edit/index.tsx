import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';
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
import { BATTLEFIELD_ROLES, getBattlefieldRole } from '@depot/core/utils/datasheets';
import RosterIssues from '@/routes/rosters/_components/roster-issues';
import { formatRosterIssue } from '@/utils/roster';

const unitPoints = (unit: depot.RosterUnit) => parseInt(unit.modelCost.cost, 10) || 0;

const RosterEdit: FC = () => {
  const { t } = useTranslation('common');
  const { t: rosterT } = useTranslation(['rosters', 'catalog']);
  const { state: roster, duplicateUnit, removeUnit } = useRoster();
  const navigate = useNavigate();

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

  const issuesByUnit = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const issue of validateRoster(roster)) {
      if (!issue.unitId) continue;
      map.set(issue.unitId, [...(map.get(issue.unitId) ?? []), formatRosterIssue(issue, rosterT)]);
    }
    return map;
  }, [roster, rosterT]);

  const enhancementsByUnit = useMemo(
    () => new Map(roster.enhancements.map((entry) => [entry.unitId, entry.enhancement.name])),
    [roster.enhancements]
  );

  useScrollToHash({ enabled: Boolean(roster.id) });

  if (!roster.id) {
    return (
      <AppLayout
        title={rosterT('pages.manage')}
        back={{ to: '/rosters', label: t('navigation.rosters') }}
      >
        <Loader />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={rosterT('pages.manageTitle', { name: roster.name })}
      back={{ to: '/rosters', label: t('navigation.rosters') }}
      heading={{ title: roster.name, subtitle: getRosterSubtitle(roster) }}
      actions={[
        {
          icon: <Pencil size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}/details`),
          ariaLabel: rosterT('pages.editDetails')
        },
        {
          icon: <Eye size={16} />,
          onClick: () => navigate(`/rosters/${roster.id}`),
          ariaLabel: rosterT('pages.view'),
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
          {rosterT('units.add')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="surface-card p-3 lg:sticky lg:top-0 lg:z-10">
          <RosterHeader roster={roster} />
        </div>

        <RosterIssues roster={roster} />

        {sections.length > 0 ? (
          sections.map(({ role, units, points }) => (
            <RosterSection
              key={role}
              title={rosterT(`catalog:roles.${role}`)}
              count={`${units.length} · ${points} ${rosterT('units.pointsCaption')}`}
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
            title={rosterT('units.empty')}
            dataTestId="empty-roster-state"
            action={{
              label: rosterT('units.add'),
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
