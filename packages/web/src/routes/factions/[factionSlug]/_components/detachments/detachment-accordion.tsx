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
    <div className="border border-subtle rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 surface-muted"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-start">
          <span className="text-left text-base font-semibold text-foreground">{title}</span>
          {subtitle ? <span className="text-left text-xs text-muted">{subtitle}</span> : null}
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-subtle" />
        ) : (
          <ChevronDown size={18} className="text-subtle" />
        )}
      </button>

      {isOpen ? (
        <div className="px-4 py-4 bg-white dark:bg-gray-950 border-t border-subtle">{children}</div>
      ) : null}
    </div>
  );
};

export default DetachmentAccordion;
