import { cx } from '@/utils/cx';

export interface PillTab<T extends string> {
  value: T;
  label: string;
  count: number;
  /** Tint applied only while this tab is selected, e.g. a build-state colour. */
  activeClassName?: string;
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
  <div
    className="flex flex-wrap items-center gap-0.5 rounded-sm bg-surface-muted p-0.5"
    role="tablist"
    aria-label={ariaLabel}
  >
    {tabs.map((tab) => {
      const isActive = tab.value === active;
      return (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={cx(
            'flex items-center gap-2 rounded-sm border px-3 min-h-11 text-sm font-medium transition-colors',
            isActive
              ? (tab.activeClassName ?? 'bg-surface-soft text-foreground border-border-strong')
              : 'border-transparent text-muted hover:text-foreground'
          )}
          onClick={() => onChange(tab.value)}
          data-testid={testIdPrefix ? `${testIdPrefix}-${tab.value}` : undefined}
        >
          <span>{tab.label}</span>
          <span
            className={cx(
              'inline-flex items-center justify-center font-mono text-xs font-bold',
              isActive && tab.activeClassName
                ? 'text-current'
                : isActive
                  ? 'text-accent'
                  : 'text-subtle'
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
