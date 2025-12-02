import React from 'react';
import type { depot } from '@depot/core';
import FactionGrid from './faction-grid';

interface AllianceSectionProps {
  alliance: string;
  factions: depot.Index[];
  loading?: boolean;
}

const AllianceSection: React.FC<AllianceSectionProps> = ({
  alliance,
  factions,
  loading = false
}) => {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground capitalize">{alliance}</h2>
        <span className="inline-flex items-center rounded-full border border-subtle surface-soft px-3 py-1 text-xs font-medium text-secondary">
          {factions.length} {factions.length === 1 ? 'faction' : 'factions'}
        </span>
      </header>
      <FactionGrid factions={factions} loading={loading} />
    </section>
  );
};

export default AllianceSection;
