import type { FC, ReactNode } from 'react';

interface RosterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  headerContent?: ReactNode;
}

const RosterSection: FC<RosterSectionProps> = ({
  title,
  children,
  className = '',
  'data-testid': dataTestId,
  headerContent
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`} data-testid={dataTestId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {headerContent ? <div className="flex items-center gap-2">{headerContent}</div> : null}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

export default RosterSection;
