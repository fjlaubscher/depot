import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';

import { RosterSection, StratagemCard } from '@/components/shared';
import { Alert, Loader } from '@/components/ui';

interface StratagemsTabProps {
  coreStratagems?: depot.Stratagem[];
  detachmentStratagems: depot.Stratagem[];
  units: depot.RosterUnit[];
  loadingCore: boolean;
  coreError: string | null;
}

interface CategoryTab {
  value: string;
  label: string;
  count: number;
}

const CORE_CATEGORY_ORDER = ['Core', 'Boarding Actions', 'Challenger'];

const getStratagemCategory = (type: string): string => {
  if (!type) {
    return 'Other';
  }

  const [rawPrefix] = type.split('–').map((segment) => segment.trim());
  if (!rawPrefix) {
    return 'Other';
  }

  return rawPrefix.replace(/ stratagem$/i, '');
};

const getStratagemKey = (stratagem: depot.Stratagem): string =>
  stratagem.id || stratagem.name.toLowerCase();

const StratagemsTab: React.FC<StratagemsTabProps> = ({
  coreStratagems,
  detachmentStratagems,
  units,
  loadingCore,
  coreError
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const availabilityMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    units.forEach((unit) => {
      const stratagems = unit.datasheet.stratagems ?? [];

      stratagems.forEach((stratagem) => {
        const key = getStratagemKey(stratagem);
        if (!map.has(key)) {
          map.set(key, new Set());
        }
        map.get(key)?.add(unit.datasheet.name);
      });
    });

    return map;
  }, [units]);

  const categoryTabs = useMemo<CategoryTab[]>(() => {
    if (!coreStratagems || coreStratagems.length === 0) {
      return [{ value: 'All', label: 'All', count: 0 }];
    }

    const counts = coreStratagems.reduce<Record<string, number>>((acc, strat) => {
      const category = getStratagemCategory(strat.type);
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    }, {});

    const ordered = [
      ...CORE_CATEGORY_ORDER.filter((category) => counts[category]),
      ...Object.keys(counts)
        .filter((category) => !CORE_CATEGORY_ORDER.includes(category))
        .sort((a, b) => a.localeCompare(b))
    ];

    const tabs = ordered.map((category) => ({
      value: category,
      label: category,
      count: counts[category]
    }));

    return [{ value: 'All', label: 'All', count: coreStratagems.length }, ...tabs];
  }, [coreStratagems]);

  useEffect(() => {
    if (activeCategory === 'All') {
      return;
    }

    const hasActiveCategory = categoryTabs.some((tab) => tab.value === activeCategory);
    if (!hasActiveCategory) {
      setActiveCategory('All');
    }
  }, [activeCategory, categoryTabs]);

  const filteredCoreStratagems = useMemo(() => {
    if (!coreStratagems || activeCategory === 'All') {
      return coreStratagems ?? [];
    }

    return coreStratagems.filter(
      (stratagem) => getStratagemCategory(stratagem.type) === activeCategory
    );
  }, [coreStratagems, activeCategory]);

  const getUnitNamesForStratagem = (stratagem: depot.Stratagem): string[] => {
    const key = getStratagemKey(stratagem);
    const unitNames = availabilityMap.get(key);
    if (!unitNames) {
      return [];
    }
    return Array.from(unitNames).sort((a, b) => a.localeCompare(b));
  };

  const renderStratagemGrid = (stratagems: depot.Stratagem[], testId: string) => {
    if (stratagems.length === 0) {
      return <p className="text-sm text-subtle">No stratagems available.</p>;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2" data-testid={testId}>
        {stratagems.map((stratagem) => (
          <StratagemCard
            key={stratagem.id || stratagem.name}
            stratagem={stratagem}
            unitNames={getUnitNamesForStratagem(stratagem)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6" data-testid="stratagems-tab">
      <RosterSection title="Core Stratagems" data-testid="core-stratagems-section">
        <div className="flex flex-col gap-3">
          {categoryTabs.length > 1 ? (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Core stratagem types">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === tab.value}
                  className={classNames(
                    'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    activeCategory === tab.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-subtle text-subtle hover:text-foreground'
                  )}
                  onClick={() => setActiveCategory(tab.value)}
                >
                  <span>{tab.label}</span>
                  <span
                    className={classNames(
                      'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs',
                      activeCategory === tab.value
                        ? 'bg-white text-primary-600'
                        : 'bg-gray-100 text-body dark:bg-gray-800 dark:text-gray-300'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {loadingCore ? (
            <div className="flex justify-center py-6">
              <Loader />
            </div>
          ) : coreError ? (
            <Alert variant="error" title="Unable to load core stratagems">
              {coreError}
            </Alert>
          ) : (
            renderStratagemGrid(filteredCoreStratagems, 'core-stratagems-grid')
          )}
        </div>
      </RosterSection>

      <RosterSection title="Detachment Stratagems" data-testid="detachment-stratagems-section">
        {detachmentStratagems.length > 0 ? (
          renderStratagemGrid(detachmentStratagems, 'detachment-stratagems-grid')
        ) : (
          <p className="text-sm text-subtle">No detachment stratagems available for this roster.</p>
        )}
      </RosterSection>
    </div>
  );
};

export default StratagemsTab;
