import type { FC } from 'react';
import classNames from 'classnames';
import type { DatasheetRoleTab } from '@/hooks/use-datasheet-browser';

interface DatasheetRoleTabsProps {
  tabs: DatasheetRoleTab[];
  activeRole: string | null;
  onChange: (role: string | null) => void;
  className?: string;
}

const formatLabel = (label: string) => (label === 'All' ? label : label.toUpperCase());

export const DatasheetRoleTabs: FC<DatasheetRoleTabsProps> = ({
  tabs,
  activeRole,
  onChange,
  className
}) => {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={classNames('flex gap-2 overflow-x-auto pb-1', className)}
      role="tablist"
      aria-label="Datasheet roles"
    >
      {tabs.map((tab) => {
        const isActive = tab.role === activeRole;
        const tabId = tab.role ? `datasheet-role-${tab.role}` : 'datasheet-role-all';

        return (
          <button
            key={tabId}
            id={tabId}
            role="tab"
            aria-selected={isActive}
            aria-controls="datasheet-results"
            onClick={() => onChange(tab.role)}
            className={classNames(
              'flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white'
            )}
          >
            <span>{formatLabel(tab.label)}</span>
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
    </div>
  );
};

export default DatasheetRoleTabs;
