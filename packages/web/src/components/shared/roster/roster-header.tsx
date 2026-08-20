import type { FC } from 'react';
import type { depot } from '@depot/core';

interface RosterHeaderProps {
  roster: {
    points: { current: number; max?: number };
    enhancements?: { enhancement: depot.Enhancement; unitId: string }[];
    detachment?: depot.Detachment;
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
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-subtle">Points</span>
        <span className={`font-semibold ${pointsColor}`} data-testid="points-display">
          {pointsDisplay}
        </span>
      </div>
      {roster.detachment?.dp ? (
        <div className="flex items-center gap-2" data-testid="detachment-dp">
          <span className="text-subtle">DP</span>
          <span className="font-semibold text-foreground">{roster.detachment.dp}</span>
        </div>
      ) : null}
      {roster.detachment?.forceDisposition ? (
        <div className="flex items-center gap-2" data-testid="detachment-disposition">
          <span className="text-subtle">Disposition</span>
          <span className="font-semibold text-foreground">
            {roster.detachment.forceDisposition}
          </span>
        </div>
      ) : null}
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
