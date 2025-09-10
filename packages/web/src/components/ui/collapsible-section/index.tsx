import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import classNames from 'classnames';

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
}

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = false,
  children,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Generate unique ID for accessibility
  const contentId = `collapsible-content-${Math.random().toString(36).substr(2, 9)}`;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={classNames('border border-gray-200 dark:border-gray-700 rounded-lg', className)}
    >
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div id={contentId} className="border-t border-gray-200 dark:border-gray-700 p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
