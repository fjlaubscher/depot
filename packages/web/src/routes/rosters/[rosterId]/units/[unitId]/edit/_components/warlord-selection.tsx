import React from 'react';
import type { depot } from '@depot/core';
import { ToggleSwitch } from '@/components/ui';

interface WarlordSelectionProps {
  unit: depot.RosterUnit;
  roster: depot.Roster;
  isWarlord: boolean;
  onWarlordChange: (isWarlord: boolean) => void;
}

const WarlordSelection: React.FC<WarlordSelectionProps> = ({
  unit,
  roster,
  isWarlord,
  onWarlordChange
}) => {
  const currentWarlord = roster.units.find((u) => u.id === roster.warlordUnitId);
  // Only the consequence is worth spelling out: nominating steals the title.
  const takesOverFrom =
    currentWarlord && currentWarlord.id !== unit.id ? currentWarlord.datasheet.name : undefined;

  return (
    <div
      className="surface-card flex items-center gap-3 px-3 py-2.5"
      data-testid="warlord-selection"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-tight font-bold text-foreground">Warlord</p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
          {takesOverFrom ? `Takes the title from ${takesOverFrom}.` : 'One character per army.'}
        </p>
      </div>
      <ToggleSwitch
        label=""
        ariaLabel="Nominate as warlord"
        enabled={isWarlord}
        onChange={onWarlordChange}
        size="sm"
      />
    </div>
  );
};

export default WarlordSelection;
