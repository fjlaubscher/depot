import type { FC, ReactNode } from 'react';

interface RosterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

const RosterSection: FC<RosterSectionProps> = ({
  title,
  children,
  className = '',
  'data-testid': dataTestId
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`} data-testid={dataTestId}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

export default RosterSection;
