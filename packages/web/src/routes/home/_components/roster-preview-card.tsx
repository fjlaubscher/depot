import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';

import { Card, Tag } from '@/components/ui';

interface RosterPreviewCardProps {
  roster: depot.Roster;
}

const RosterPreviewCard: FC<RosterPreviewCardProps> = ({ roster }) => {
  const unitCount = roster.units.length;
  const unitLabel = unitCount === 1 ? 'unit' : 'units';

  return (
    <Link
      to={`/rosters/${roster.id}`}
      className="group/link block h-full text-decoration-none"
      data-testid="roster-preview-card"
    >
      <Card interactive className="flex h-full flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Card.Title
              as="h3"
              className="truncate text-base transition-colors duration-200 group-hover/link:text-accent"
            >
              {roster.name}
            </Card.Title>
            <Card.Subtitle as="span" className="truncate text-xs">
              {roster.faction?.name ?? roster.factionSlug ?? roster.factionId}
            </Card.Subtitle>
          </div>
          <Tag variant="primary" size="sm" className="shrink-0 whitespace-nowrap">
            {roster.points.current}/{roster.points.max}
          </Tag>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1">
          {roster.detachment?.name ? (
            <Tag size="sm" variant="secondary" className="uppercase tracking-wide">
              {roster.detachment.name}
            </Tag>
          ) : null}
          <Tag size="sm" variant="default">
            {unitCount} {unitLabel}
          </Tag>
        </div>
      </Card>
    </Link>
  );
};

export default RosterPreviewCard;
