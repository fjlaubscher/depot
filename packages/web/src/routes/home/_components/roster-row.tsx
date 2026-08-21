import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';

import { getRosterDetachments } from '@depot/core/utils/roster';
import { cx } from '@/utils/cx';
import { relativeTime } from '@/utils/recent';

interface Props {
  roster: depot.Roster;
  invalid: boolean;
}

const RosterRow: FC<Props> = ({ roster, invalid }) => {
  const over = roster.points.current > roster.points.max;
  const detachments = getRosterDetachments(roster);

  return (
    <Link
      to={`/rosters/${roster.id}`}
      className="surface-card flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:border-border-accent"
      data-testid="roster-preview-card"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-[13.5px] leading-tight font-bold text-foreground">
            {roster.name}
          </span>
          {invalid && (
            <span className="shrink-0 rounded-xs border border-danger-border bg-danger-surface px-1 py-0.5 font-mono text-[8.5px] font-bold text-danger-fg">
              INVALID
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] font-medium uppercase text-muted">
          {[roster.faction?.name ?? roster.factionSlug, detachments[0]?.name]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={cx(
            'font-mono text-[13px] leading-none font-bold',
            over ? 'text-danger-fg' : 'text-foreground'
          )}
        >
          {roster.points.current}
          <span className="text-subtle">/{roster.points.max}</span>
        </div>
        <div className="mt-0.5 font-mono text-[9px] font-medium text-subtle">
          EDITED {relativeTime(roster.updatedAt)}
        </div>
      </div>
    </Link>
  );
};

export default RosterRow;
