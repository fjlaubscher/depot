import type { FC, ReactNode } from 'react';

interface RosterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const RosterSection: FC<RosterSectionProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

export default RosterSection;
