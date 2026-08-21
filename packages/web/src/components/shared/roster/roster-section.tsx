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
      <div className="flex items-center gap-2">
        <h3 className="type-section shrink-0">
          <span aria-hidden="true">// </span>
          {title}
        </h3>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      {belowContent ? <div className="flex flex-col gap-2">{belowContent}</div> : null}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};

export default RosterSection;
