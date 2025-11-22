import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import classNames from 'classnames';

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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Generate unique ID for accessibility
  const contentId = `collapsible-content-${Math.random().toString(36).substr(2, 9)}`;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={classNames('border border-subtle rounded-lg', className)}
      data-testid={dataTestId}
    >
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {isExpanded ? (
          <ChevronUp size={20} className="text-subtle" />
        ) : (
          <ChevronDown size={20} className="text-subtle" />
        )}
      </button>

      {isExpanded && (
        <div id={contentId} className="border-t border-subtle p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
