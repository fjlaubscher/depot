import type { FC } from 'react';
import { cx } from '@/utils/cx';
import { CODEX_SLUG } from '@depot/core/utils/datasheets';
import {
  DEFAULT_TAB_ACTIVE_CLASS,
  DEFAULT_TAB_INACTIVE_CLASS,
  getSupplementStyles
} from '@/utils/supplement-styles';

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
    <div
      role="tablist"
      aria-label="Datasheet supplements"
      data-testid="supplement-tabs"
      className={cx('flex flex-col gap-2', className)}
    >
      <span className="text-sm font-medium text-muted">Supplements</span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = tab.value === activeValue;
          const tabId = `datasheet-supplement-${tab.value}`;
          const isNeutral = tab.value === 'all' || tab.value === CODEX_SLUG;
          const styles = getSupplementStyles(isNeutral ? null : tab.value);

          const activeClass = styles.tabActiveClass || DEFAULT_TAB_ACTIVE_CLASS;
          const inactiveClass = styles.tabInactiveClass || DEFAULT_TAB_INACTIVE_CLASS;

          return (
            <button
              key={tabId}
              id={tabId}
              role="tab"
              aria-selected={isActive}
              aria-controls="datasheet-results"
              onClick={() => onChange(tab.value)}
              data-testid={`supplement-tab-${tab.value}`}
              data-supplement-key={isNeutral ? undefined : tab.value}
              className={cx(
                'flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-sm border px-4 min-h-11 text-sm font-medium transition-colors',
                isActive ? activeClass : inactiveClass
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cx(
                  'inline-flex items-center justify-center font-mono text-xs font-bold',
                  isActive
                    ? 'bg-surface-soft text-accent border border-border-strong'
                    : 'bg-surface-muted text-muted border border-transparent'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatasheetSupplementTabs;
