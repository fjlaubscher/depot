import type { FC } from 'react';
import type { depot } from '@depot/core';
import { getRosterDetachments } from '@depot/core/utils/roster';
import { getBattleSize, getRosterDpSpent } from '@depot/core/utils/roster-legality';

interface RosterHeaderProps {
  roster: {
    points: { current: number; max?: number };
    enhancements?: { enhancement: depot.Enhancement; unitId: string }[];
    detachments?: depot.Detachment[];
    detachment?: depot.Detachment;
    units?: depot.RosterUnit[];
  };
}

const RosterHeader: FC<RosterHeaderProps> = ({ roster }) => {
  const hasCap = typeof roster.points.max === 'number';
  const pointsColor = hasCap
    ? roster.points.current > (roster.points.max ?? 0)
      ? 'text-danger'
      : roster.points.current === roster.points.max
        ? 'text-warning'
        : 'text-success'
    : 'text-foreground';

  const pointsDisplay = hasCap
    ? `${roster.points.current}/${roster.points.max}`
    : roster.points.current;

  const detachments = getRosterDetachments(roster);
  const dpSpent = getRosterDpSpent({ ...roster, units: roster.units ?? [] });
  const dpCap = hasCap ? getBattleSize(roster.points.max ?? 0).dp : null;
  const dpColor =
    dpCap !== null && detachments.length > 1 && dpSpent > dpCap ? 'text-danger' : 'text-foreground';

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-subtle">Points</span>
        <span className={`font-semibold ${pointsColor}`} data-testid="points-display">
          {pointsDisplay}
        </span>
      </div>
      {detachments.length > 0 ? (
        <div className="flex items-center gap-2" data-testid="detachment-dp">
          <span className="text-subtle">DP</span>
          <span className={`font-semibold ${dpColor}`}>
            {dpCap !== null ? `${dpSpent}/${dpCap}` : dpSpent}
          </span>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <span className="text-subtle">Enhancements</span>
        <span className="font-semibold text-foreground">{roster.enhancements?.length ?? 0}</span>
      </div>
    </div>
  );
};

export default RosterHeader;
