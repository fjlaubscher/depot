import type { FC } from 'react';
import { depot } from '@depot/core';

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
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 dark:text-gray-400">Points</span>
        <span className={`font-semibold ${pointsColor}`}>
          {roster.points.current} / {roster.points.max}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 dark:text-gray-400">Enhancements</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {roster.enhancements.length}
        </span>
      </div>
    </div>
  );
};

export default RosterHeader;
