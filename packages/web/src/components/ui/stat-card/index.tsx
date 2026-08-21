import type { FC } from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-gray-200 dark:bg-gray-800 text-foreground rounded text-center py-1 px-2 min-w-10 sm:min-w-12">
    <div className="text-[10px] sm:text-xs font-semibold text-secondary">{label}</div>
    <div className="text-xs sm:text-sm font-bold tabular-nums">{value}</div>
  </div>
);

export default StatCard;
