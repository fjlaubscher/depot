import React from 'react';
import type { depot } from '@depot/core';
import FactionGrid from './faction-grid';

interface AllianceSectionProps {
  alliance: string;
  factions: depot.Index[];
}

const AllianceSection: React.FC<AllianceSectionProps> = ({ alliance, factions }) => {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground capitalize">{alliance}</h2>
        <span className="inline-flex items-center rounded-xs border border-border-subtle bg-surface-soft px-3 py-1 text-xs font-medium text-muted">
          {factions.length} {factions.length === 1 ? 'faction' : 'factions'}
        </span>
      </header>
      <FactionGrid factions={factions} />
    </section>
  );
};

export default AllianceSection;
