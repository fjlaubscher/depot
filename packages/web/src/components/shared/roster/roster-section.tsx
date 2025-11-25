import type { FC, ReactNode } from 'react';

interface RosterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  headerContent?: ReactNode;
  belowContent?: ReactNode;
}

const RosterSection: FC<RosterSectionProps> = ({
  title,
  children,
  className = '',
  'data-testid': dataTestId,
  headerContent,
  belowContent
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`} data-testid={dataTestId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {headerContent ? <div className="flex items-center gap-2">{headerContent}</div> : null}
      </div>
      {belowContent ? <div className="flex flex-col gap-2">{belowContent}</div> : null}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};

export default RosterSection;
