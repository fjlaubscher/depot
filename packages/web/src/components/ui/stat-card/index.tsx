import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded py-2 text-center min-w-[56px]">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</div>
      <div className="text-md font-bold tabular-nums">{value}</div>
    </div>
  );
};

export default StatCard;
