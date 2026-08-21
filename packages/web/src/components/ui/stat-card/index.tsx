import type { FC } from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: FC<StatCardProps> = ({ label, value }) => (
  <div className="stat-cell">
    <div className="type-label">{label}</div>
    <div className="type-stat">{value}</div>
  </div>
);

export default StatCard;
