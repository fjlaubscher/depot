import type { FC } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  size?: 'default' | 'compact';
}

const StatCard: FC<StatCardProps> = ({ label, value, size = 'default' }) => {
  const sizeClasses = {
    default: {
      container: 'py-1 px-2 min-w-12 sm:py-2 sm:min-w-16',
      label: 'text-[11px] leading-tight sm:text-xs',
      value: 'text-sm sm:text-base'
    },
    compact: {
      container: 'py-1 px-2 min-w-10 sm:min-w-12',
      label: 'text-[10px] sm:text-xs',
      value: 'text-xs sm:text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-800 text-foreground rounded text-center ${classes.container}`}
    >
      <div className={`${classes.label} font-semibold text-secondary`}>{label}</div>
      <div className={`${classes.value} font-bold tabular-nums`}>{value}</div>
    </div>
  );
};

export default StatCard;
