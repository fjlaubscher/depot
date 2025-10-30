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
      <header>
        <h2 className="text-xl font-semibold text-foreground capitalize">{alliance}</h2>
      </header>
      <FactionGrid factions={factions} loading={loading} />
    </section>
  );
};

export default AllianceSection;
