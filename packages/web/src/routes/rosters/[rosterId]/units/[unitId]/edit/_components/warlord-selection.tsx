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
  // Check if there are other characters in the roster that could be warlords
  const otherCharacters = roster.units.filter(
    (u) =>
      u.id !== unit.id &&
      u.datasheet.keywords.some((k) => k.keyword.toLowerCase().includes('character'))
  );

  const currentWarlord = roster.warlordUnitId
    ? roster.units.find((u) => u.id === roster.warlordUnitId)
    : undefined;

  return (
    <div className="flex flex-col gap-4" data-testid="warlord-selection">
      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/30 rounded hover:bg-gray-100/80 dark:hover:bg-gray-600/40 transition-colors">
        <div className="flex flex-col gap-2">
          <h5 className="font-medium text-foreground">Nominate as Warlord</h5>
          <p className="text-sm text-muted">
            Designate this character as your army's warlord. Only one character can be the warlord.
          </p>

          {currentWarlord && currentWarlord.id !== unit.id && (
            <div className="text-sm text-warning">
              ⚠️ Current warlord: {currentWarlord.datasheet.name}
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

      {isWarlord && (
        <div className="flex flex-col gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h5 className="font-medium text-purple-900 dark:text-purple-200 flex items-center gap-2">
            👑 Warlord Benefits
          </h5>
          <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1 list-disc pl-6">
            <li>May have special deployment or strategic abilities</li>
            <li>Target for certain enemy abilities and victory conditions</li>
          </ul>
        </div>
      )}

      {/* Warning about changing warlord */}
      {isWarlord && currentWarlord && currentWarlord.id !== unit.id && (
        <div className="flex flex-col gap-2 p-3 surface-warning border-warning rounded-lg">
          <h5 className="font-medium text-warning-strong">⚠️ Warlord Change</h5>
          <p className="text-sm text-warning">
            Nominating this character as warlord will remove the warlord designation from{' '}
            {currentWarlord.datasheet.name}.
          </p>
        </div>
      )}
    </div>
  );
};

export default WarlordSelection;
