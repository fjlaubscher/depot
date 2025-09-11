import type { FC } from 'react';
import { depot } from '@depot/core';
import { Stat } from '@/components/ui';

interface RosterHeaderProps {
  roster: depot.Roster;
}

const RosterHeader: FC<RosterHeaderProps> = ({ roster }) => {
  const pointsColor =
    roster.points.current > roster.points.max
      ? 'text-red-500 dark:text-red-400'
      : roster.points.current === roster.points.max
        ? 'text-yellow-500 dark:text-yellow-400'
        : 'text-green-500 dark:text-green-400';

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center gap-4">
        <Stat
          title="Points"
          value={
            <span className={pointsColor}>
              {roster.points.current} / {roster.points.max}
            </span>
          }
        />
        <Stat title="Units" value={roster.units.length.toString()} />
        <Stat title="Enhancements" value={roster.enhancements.length.toString()} />
      </div>
    </div>
  );
};

export default RosterHeader;
