import type { FC } from 'react';
import type { depot } from '@depot/core';

interface RosterHeaderProps {
  roster: {
    points: { current: number; max?: number };
    enhancements?: { enhancement: depot.Enhancement; unitId: string }[];
  };
  showEnhancements?: boolean;
  showMax?: boolean;
}

const RosterHeader: FC<RosterHeaderProps> = ({
  roster,
  showEnhancements = true,
  showMax = true
}) => {
  const hasCap = typeof roster.points.max === 'number' && showMax;
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

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-subtle">Points</span>
        <span className={`font-semibold ${pointsColor}`} data-testid="points-display">
          {pointsDisplay}
        </span>
      </div>
      {showEnhancements ? (
        <div className="flex items-center gap-2">
          <span className="text-subtle">Enhancements</span>
          <span className="font-semibold text-foreground">{roster.enhancements?.length ?? 0}</span>
        </div>
      ) : null}
    </div>
  );
};

export default RosterHeader;
