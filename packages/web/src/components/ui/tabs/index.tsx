import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: string[];
  active?: number;
  onChange?: (index: number) => void;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, active = 0, onChange, className, children, ...props }) => {
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
    <div className={classNames('w-full flex flex-col gap-4', className)} {...props}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto" aria-label="Tabs">
          {validTabs.map((tab, index) => (
            <button
              key={`tab-${index}`}
              onClick={() => handleTabClick(index)}
              className={classNames(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex-shrink-0',
                {
                  'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400':
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
      <div>{validChildren[activeTab] || null}</div>
    </div>
  );
};

export default Tabs;
