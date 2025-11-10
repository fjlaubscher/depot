import type { FC } from 'react';
import type { depot } from '@depot/core';

interface RosterHeaderProps {
  roster: depot.Roster;
}

const RosterHeader: FC<RosterHeaderProps> = ({ roster }) => {
  const pointsColor =
    roster.points.current > roster.points.max
      ? 'text-danger'
      : roster.points.current === roster.points.max
        ? 'text-warning'
        : 'text-success';

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-subtle">Points</span>
        <span className={`font-semibold ${pointsColor}`} data-testid="points-display">
          {roster.points.current}/{roster.points.max}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-subtle">Enhancements</span>
        <span className="font-semibold text-foreground">{roster.enhancements.length}</span>
      </div>
    </div>
  );
};

export default RosterHeader;
