import type { FC } from 'react';
import classNames from 'classnames';
import ScrollableTabRow from './scrollable-tab-row';

export interface SupplementTab {
  value: string;
  label: string;
  count: number;
}

interface DatasheetSupplementTabsProps {
  tabs: SupplementTab[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DatasheetSupplementTabs: FC<DatasheetSupplementTabsProps> = ({
  tabs,
  activeValue,
  onChange,
  className
}) => {
  if (tabs.length <= 1) {
    return null;
  }

  return (
    <ScrollableTabRow
      className={className}
      label="Supplements"
      containerProps={{ role: 'tablist', 'aria-label': 'Datasheet supplements' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;
        const tabId = `datasheet-supplement-${tab.value}`;

        return (
          <button
            key={tabId}
            id={tabId}
            role="tab"
            aria-selected={isActive}
            aria-controls="datasheet-results"
            onClick={() => onChange(tab.value)}
            className={classNames(
              'flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={classNames(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
                isActive
                  ? 'bg-white text-primary-600 dark:text-primary-500'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </ScrollableTabRow>
  );
};

export default DatasheetSupplementTabs;
