import { useState, type FC, type ReactNode, type SyntheticEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '@/utils/cx';

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  dataTestId?: string;
}

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = false,
  children,
  className = '',
  dataTestId
}) => {
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <details
      open={open}
      onToggle={(event: SyntheticEvent<HTMLDetailsElement>) => {
        setOpen(event.currentTarget.open);
      }}
      className={cx('group border border-border-subtle rounded-sm', className)}
      data-testid={dataTestId}
    >
      {/* No role override: native <summary> is what exposes expanded/collapsed to assistive tech. */}
      <summary className="flex items-center justify-between min-h-11 p-4 list-none hover:bg-surface-soft transition-colors cursor-pointer [&::-webkit-details-marker]:hidden">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <ChevronDown
          size={20}
          className="text-subtle transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border-subtle p-4">{children}</div>
    </details>
  );
};

export default CollapsibleSection;
