import type { FC, ReactNode } from 'react';
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
}) => (
  <details
    open={defaultExpanded}
    className={cx('group border border-subtle rounded-lg', className)}
    data-testid={dataTestId}
  >
    {/* role="button" keeps the a11y tree (and tests) identical to the old <button aria-expanded>. */}
    <summary
      role="button"
      className="flex items-center justify-between p-4 list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer [&::-webkit-details-marker]:hidden"
    >
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <ChevronDown
        size={20}
        className="text-subtle transition-transform duration-200 group-open:rotate-180"
      />
    </summary>
    <div className="border-t border-subtle p-4">{children}</div>
  </details>
);

export default CollapsibleSection;
