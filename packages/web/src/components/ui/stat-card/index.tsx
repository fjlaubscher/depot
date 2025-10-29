import type { FC } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  size?: 'default' | 'compact';
}

const StatCard: FC<StatCardProps> = ({ label, value, size = 'default' }) => {
  const sizeClasses = {
    default: {
      container: 'py-2 min-w-[56px]',
      label: 'text-xs',
      value: 'text-md'
    },
    compact: {
      container: 'py-1 min-w-[48px]',
      label: 'text-xs',
      value: 'text-sm'
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
