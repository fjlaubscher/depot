import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = false,
  children,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {isExpanded ? (
          <FaChevronUp className="text-gray-500 dark:text-gray-400" />
        ) : (
          <FaChevronDown className="text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">{children}</div>
      )}
    </div>
  );
};

export default CollapsibleSection;
