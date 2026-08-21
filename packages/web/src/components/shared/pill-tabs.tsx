import classNames from 'classnames';

export interface PillTab<T extends string> {
  value: T;
  label: string;
  count: number;
}

interface PillTabsProps<T extends string> {
  tabs: PillTab<T>[];
  active: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** Emits `${testIdPrefix}-${value}` on each pill. */
  testIdPrefix?: string;
}

/** Rounded filter pills with a count badge (stratagem categories, collection state filter). */
const PillTabs = <T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  testIdPrefix
}: PillTabsProps<T>) => (
  <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={ariaLabel}>
    {tabs.map((tab) => {
      const isActive = tab.value === active;
      return (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={classNames(
            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
              : 'border-subtle text-secondary hover:text-foreground hover:border-border'
          )}
          onClick={() => onChange(tab.value)}
          data-testid={testIdPrefix ? `${testIdPrefix}-${tab.value}` : undefined}
        >
          <span>{tab.label}</span>
          <span
            className={classNames(
              'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
              isActive ? 'bg-white text-primary-600 dark:text-primary-500' : 'bg-soft text-muted'
            )}
          >
            {tab.count}
          </span>
        </button>
      );
    })}
  </div>
);

export default PillTabs;
