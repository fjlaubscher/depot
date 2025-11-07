import React from 'react';
import classNames from 'classnames';
import type { DetachmentSection, DetachmentSectionKey } from './types';

interface DetachmentPillNavProps {
  sections: DetachmentSection[];
  activeKey: DetachmentSectionKey;
  onChange: (key: DetachmentSectionKey) => void;
}

const DetachmentPillNav: React.FC<DetachmentPillNavProps> = ({ sections, activeKey, onChange }) => {
  return (
    <div className="flex justify-center">
      <div className="max-w-full overflow-x-auto">
        <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full">
          {sections.map((section) => {
            const isActive = section.key === activeKey;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => onChange(section.key)}
                disabled={section.disabled}
                className={classNames(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 whitespace-nowrap',
                  isActive
                    ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-300'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetachmentPillNav;
