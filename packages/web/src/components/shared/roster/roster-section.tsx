import type { FC, ReactNode } from 'react';

interface RosterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  belowContent?: ReactNode;
}

const RosterSection: FC<RosterSectionProps> = ({
  title,
  children,
  className = '',
  'data-testid': dataTestId,
  belowContent
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`} data-testid={dataTestId}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {belowContent ? <div className="flex flex-col gap-2">{belowContent}</div> : null}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};

export default RosterSection;
