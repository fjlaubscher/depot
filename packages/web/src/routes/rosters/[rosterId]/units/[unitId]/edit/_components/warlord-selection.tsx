import React from 'react';
import type { depot } from '@depot/core';
import { ToggleSwitch } from '@/components/ui';
import { isCharacter } from '@depot/core/utils/datasheets';

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
  // Check if there are other characters in the roster that could be warlords
  const otherCharacters = roster.units.filter((u) => u.id !== unit.id && isCharacter(u.datasheet));

  const currentWarlord = roster.warlordUnitId
    ? roster.units.find((u) => u.id === roster.warlordUnitId)
    : undefined;

  return (
    <div className="flex flex-col gap-4" data-testid="warlord-selection">
      <div className="flex items-center justify-between min-h-11 p-3 bg-surface-muted border border-border-subtle rounded-sm hover:bg-surface-soft transition-colors">
        <div className="flex flex-col gap-2">
          <h5 className="font-medium text-foreground">Nominate as Warlord</h5>
          <p className="text-sm text-muted">
            Designate this character as your army's warlord. Only one character can be the warlord.
          </p>

          {currentWarlord && currentWarlord.id !== unit.id && (
            <div className="text-sm text-warning-fg">
              ⚠️ Current warlord: {currentWarlord.datasheet.name}. Nominating this character will
              remove their warlord designation.
            </div>
          )}

          {otherCharacters.length > 0 && (
            <div className="text-xs text-subtle">
              Other characters in roster: {otherCharacters.map((c) => c.datasheet.name).join(', ')}
            </div>
          )}
        </div>

        <ToggleSwitch label="" enabled={isWarlord} onChange={onWarlordChange} size="sm" />
      </div>
    </div>
  );
};

export default WarlordSelection;
