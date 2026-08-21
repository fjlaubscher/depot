import { useState, useEffect, Children } from 'react';
import type { FC, ReactNode, HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: string[];
  active?: number;
  onChange?: (index: number) => void;
  className?: string;
  children: ReactNode;
  tabTestIdPrefix?: string;
}

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

const Tabs: FC<TabsProps> = ({
  tabs,
  active = 0,
  onChange,
  className,
  children,
  tabTestIdPrefix,
  ...props
}) => {
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
  const validChildren = Children.toArray(children).filter((_, index) => tabs[index]?.trim() !== '');

  return (
    <div className={cx('w-full flex flex-col gap-4', className)} {...props}>
      <div className="border-b border-subtle">
        <nav className="flex gap-4 overflow-x-auto" aria-label="Tabs">
          {validTabs.map((tab, index) => (
            <button
              key={`tab-${index}`}
              onClick={() => handleTabClick(index)}
              data-testid={tabTestIdPrefix ? `${tabTestIdPrefix}-${slugify(tab)}` : undefined}
              className={cx(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex-shrink-0 cursor-pointer',
                activeTab === index
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-subtle hover:text-foreground hover:border-subtle'
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
