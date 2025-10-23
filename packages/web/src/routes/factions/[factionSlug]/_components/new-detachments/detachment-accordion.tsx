import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DetachmentAccordionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const DetachmentAccordion: React.FC<DetachmentAccordionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 dark:bg-gray-900"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-start">
          <span className="text-left text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </span>
          {subtitle ? (
            <span className="text-left text-xs text-gray-600 dark:text-gray-400">{subtitle}</span>
          ) : null}
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isOpen ? (
        <div className="px-4 py-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default DetachmentAccordion;
