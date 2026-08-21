import React from 'react';
import type { depot } from '@depot/core';

import { SectionHeader } from '@/components/ui';
import FactionCard from './faction-card';

interface AllianceSectionProps {
  alliance: string;
  factions: depot.Index[];
}

const AllianceSection: React.FC<AllianceSectionProps> = ({ alliance, factions }) => (
  <section className="flex flex-col gap-1.5">
    <SectionHeader title={alliance} count={factions.length} />
    <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
      {factions.map((faction) => (
        <FactionCard key={faction.slug} faction={faction} />
      ))}
    </div>
  </section>
);

export default AllianceSection;
