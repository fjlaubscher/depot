import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-gray-800 text-white rounded px-3 py-2 text-center min-w-[60px]">
      <div className="text-xs font-semibold text-gray-300 mb-0.5">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
};

export default StatCard;
