import React from 'react';
import { Link } from '@/lib/navigation';
import type { depot } from '@depot/core';

const FactionCard: React.FC<{ faction: depot.Index }> = ({ faction }) => (
  <Link
    to={`/faction/${faction.slug}`}
    className="surface-card min-h-11 px-2.5 py-2.5 transition-colors hover:border-border-accent focus-ring-primary"
  >
    <h3 className="text-[13px] leading-tight font-bold text-foreground">{faction.name}</h3>
    <div className="mt-1 font-mono text-[9.5px] font-medium uppercase text-muted">
      {faction.datasheetCount ?? 0} datasheets
    </div>
  </Link>
);

export default FactionCard;
