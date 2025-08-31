import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

interface TabsProps {
  tabs: string[];
  active?: number;
  onChange?: (index: number) => void;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, active = 0, onChange, className, children }) => {
  const [activeTab, setActiveTab] = useState(active);

  useEffect(() => {
    setActiveTab(active);
  }, [active]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onChange?.(index);
  };

  // Filter out empty tab names
  const validTabs = tabs.filter((tab) => tab.trim() !== '');
  const validChildren = React.Children.toArray(children).filter(
    (_, index) => tabs[index]?.trim() !== ''
  );

  return (
    <div className={classNames('w-full', className)}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {validTabs.map((tab, index) => (
            <button
              key={`tab-${index}`}
              onClick={() => handleTabClick(index)}
              className={classNames(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                {
                  'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400':
                    activeTab === index,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600':
                    activeTab !== index
                }
              )}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">{validChildren[activeTab] || null}</div>
    </div>
  );
};

export default Tabs;
