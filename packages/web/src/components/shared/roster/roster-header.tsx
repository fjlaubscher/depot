import type { FC } from 'react';
import type { depot } from '@depot/core';
import { cx } from '@/utils/cx';
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
  const { current, max } = roster.points;
  const hasCap = typeof max === 'number' && max > 0;
  const isOver = hasCap && current > max;
  const isExact = hasCap && current === max;

  const pointsColor = !hasCap
    ? 'text-foreground'
    : isOver
      ? 'text-danger-fg'
      : isExact
        ? 'text-warning-fg'
        : 'text-foreground';

  const detachments = getRosterDetachments(roster);
  const dpSpent = getRosterDpSpent({ ...roster, units: roster.units ?? [] });
  const dpCap = hasCap ? getBattleSize(max).dp : null;
  const dpOver = dpCap !== null && detachments.length > 1 && dpSpent > dpCap;

  // Bar caps at 100% so an over-limit list still reads as "full plus overspend".
  const filled = hasCap ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-2" data-testid="roster-header">
      <div className="flex items-baseline gap-2">
        <span className={cx('type-stat', pointsColor)} data-testid="points-display">
          {hasCap ? `${current}/${max}` : current}
        </span>
        <span className="type-label">pts</span>

        {isOver ? (
          <span className="type-label text-danger-fg" data-testid="points-over">
            +{current - max} over
          </span>
        ) : null}

        <div className="ml-auto flex items-center gap-4">
          {detachments.length > 0 ? (
            <div className="flex items-baseline gap-1" data-testid="detachment-dp">
              <span className="type-label">DP</span>
              <span
                className={cx(
                  'font-mono text-sm font-bold',
                  dpOver ? 'text-danger-fg' : 'text-foreground'
                )}
              >
                {dpCap !== null ? `${dpSpent}/${dpCap}` : dpSpent}
              </span>
            </div>
          ) : null}
          <div className="flex items-baseline gap-1">
            <span className="type-label">ENH</span>
            <span className="font-mono text-sm font-bold text-foreground">
              {roster.enhancements?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {hasCap ? (
        <div
          className="h-1.5 w-full overflow-hidden rounded-xs bg-surface-soft"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label="Points used"
          data-testid="points-bar"
        >
          <div
            className={cx(
              'h-full transition-[width] duration-200',
              isOver
                ? 'bg-danger-fg'
                : isExact
                  ? 'bg-warning-fg'
                  : 'bg-accent-600 dark:bg-accent-500'
            )}
            style={{ width: `${filled}%` }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default RosterHeader;
