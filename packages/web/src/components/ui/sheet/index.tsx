import type { FC, ReactNode } from 'react';
import { X } from 'lucide-react';

import Drawer from '../drawer';
import IconButton from '../icon-button';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Rendered under the title (e.g. a Tag). */
  subtitle?: ReactNode;
  children: ReactNode;
  'data-testid'?: string;
}

/** Bottom sheet with a titled header, close button and scrollable body. */
const Sheet: FC<SheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  'data-testid': testId
}) => {
  const titleId = `${testId ?? 'sheet'}-title`;
  return (
    <Drawer isOpen={open} onClose={onClose} position="bottom" data-testid={testId}>
      <div
        className="flex min-h-0 flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle p-4">
          <div className="flex flex-col gap-2">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {subtitle}
          </div>
          <IconButton
            aria-label="Close"
            variant="ghost"
            onClick={onClose}
            data-testid={testId ? `${testId}-close` : undefined}
          >
            <X size={18} />
          </IconButton>
        </div>
        <div className="flex min-h-0 flex-col overflow-y-auto p-4">{children}</div>
      </div>
    </Drawer>
  );
};

export default Sheet;
