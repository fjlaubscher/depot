import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ClipboardPlus } from 'lucide-react';
import type { depot } from '@depot/core';
import classNames from 'classnames';

import AppLayout from '@/components/layout';
import { BackButton } from '@/components/shared';
import { PageHeader, Loader, Breadcrumbs, Button, Alert } from '@/components/ui';
import {
  RosterSection,
  RosterUnitCardEdit,
  RosterEmptyState,
  RosterHeader
} from '@/components/shared/roster';
import useCollection from '@/hooks/use-collection';
import usePersistedTagSelection from '@/hooks/use-persisted-tag-selection';
import {
  COLLECTION_STATE_META,
  COLLECTION_UNIT_STATES,
  calculateCollectionPoints
} from '@/utils/collection';

const COLLECTION_STATE_FILTER_KEY = 'collection-state-filter';

const CollectionPageContent: React.FC<{ collectionId?: string }> = ({ collectionId }) => {
  const navigate = useNavigate();
  const { collection, loading, error, save } = useCollection(collectionId);
  const {
    selection: persistedStateFilter,
    setSelection: setPersistedStateFilter,
    clearSelection: clearPersistedStateFilter
  } = usePersistedTagSelection<depot.CollectionUnitState | 'all'>(
    COLLECTION_STATE_FILTER_KEY,
    'all',
    (value) => value === 'all' || COLLECTION_UNIT_STATES.includes(value)
  );

  const stateCounts = useMemo(() => {
    if (!collection) {
      return {} as Record<depot.CollectionUnitState, number>;
    }

    return collection.items.reduce<Record<depot.CollectionUnitState, number>>(
      (acc, item) => ({
        ...acc,
        [item.state]: (acc[item.state] ?? 0) + 1
      }),
      {
        sprue: 0,
        built: 0,
        'battle-ready': 0,
        'parade-ready': 0
      }
    );
  }, [collection]);

  const stateFilters = useMemo(
    () =>
      collection
        ? [
            { state: 'all' as const, label: 'All', count: collection.items.length },
            ...COLLECTION_UNIT_STATES.map((state) => ({
              state,
              label: COLLECTION_STATE_META[state].label,
              count: stateCounts[state]
            }))
          ]
        : [],
    [collection, stateCounts]
  );

  const activeStateFilter = useMemo(() => {
    if (!persistedStateFilter || persistedStateFilter === 'all') {
      return 'all';
    }

    if (COLLECTION_UNIT_STATES.includes(persistedStateFilter)) {
      return persistedStateFilter;
    }

    return 'all';
  }, [persistedStateFilter]);

  useEffect(() => {
    if (persistedStateFilter !== activeStateFilter) {
      if (activeStateFilter === 'all') {
        clearPersistedStateFilter();
      } else {
        setPersistedStateFilter(activeStateFilter);
      }
    }
  }, [activeStateFilter, clearPersistedStateFilter, persistedStateFilter, setPersistedStateFilter]);
  const points = useMemo(
    () => (collection ? calculateCollectionPoints(collection) : 0),
    [collection]
  );

  const toRosterUnit = (item: depot.CollectionUnit): depot.RosterUnit => ({
    id: item.id,
    datasheet: item.datasheet,
    modelCost: item.modelCost,
    selectedWargear: item.selectedWargear,
    selectedWargearAbilities: item.selectedWargearAbilities,
    datasheetSlug: item.datasheetSlug
  });

  const rosterLike: { points: { current: number } } = {
    points: { current: points }
  };

  const filteredItems = useMemo(() => {
    if (!collection) {
      return [] as depot.CollectionUnit[];
    }

    if (activeStateFilter === 'all') {
      return collection.items;
    }

    return collection.items.filter((item) => item.state === activeStateFilter);
  }, [activeStateFilter, collection]);

  const handleRemove = async (unitId: string) => {
    if (!collection) return;
    const updated = {
      ...collection,
      items: collection.items.filter((item) => item.id !== unitId)
    };
    await save(updated);
  };

  const handleDuplicate = async (unit: depot.RosterUnit) => {
    if (!collection) return;
    const source = collection.items.find((item) => item.id === unit.id);
    const duplicated: depot.CollectionUnit = source
      ? { ...source, id: crypto.randomUUID() }
      : {
          id: crypto.randomUUID(),
          datasheet: unit.datasheet,
          modelCost: unit.modelCost,
          selectedWargear: unit.selectedWargear,
          selectedWargearAbilities: unit.selectedWargearAbilities,
          datasheetSlug: unit.datasheetSlug,
          state: 'sprue'
        };

    const updated = {
      ...collection,
      items: [...collection.items, duplicated]
    };
    await save(updated);
  };

  const handleAddUnits = () => {
    if (collection) {
      navigate(`/collections/${collection.id}/add-units`);
    }
  };

  const handleCreateRoster = () => {
    if (collection) {
      navigate(`/collections/${collection.id}/new-roster`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Loader />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <Alert variant="error" title="Unable to load collection">
        {error || 'Collection not found'}
      </Alert>
    );
  }

  const subtitle = `${collection.items.length} unit${collection.items.length === 1 ? '' : 's'} - ${
    collection.faction?.name || collection.factionSlug
  }`;

  return (
    <div className="flex flex-col gap-4">
      <BackButton
        to="/collections"
        label="Collections"
        ariaLabel="Back to Collections"
        className="md:hidden"
      />

      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Collections', path: '/collections' },
            { label: collection.name, path: `/collections/${collection.id}` }
          ]}
        />
      </div>

      <PageHeader
        title={collection.name}
        subtitle={subtitle}
        stats={<RosterHeader roster={rosterLike} showEnhancements={false} />}
        action={{
          icon: <ClipboardPlus size={16} />,
          onClick: handleCreateRoster,
          ariaLabel: 'Create roster from collection'
        }}
      />

      <Button
        onClick={handleAddUnits}
        className="w-full flex items-center gap-2"
        data-testid="add-collection-units-button"
      >
        <Plus size={16} />
        Add Units
      </Button>

      <RosterSection
        title="Units"
        data-testid="collection-units-section"
        className="gap-3"
        headerContent={
          <div className="flex flex-wrap items-center gap-2">
            {stateFilters.map((filter) => {
              const isActive = filter.state === activeStateFilter;

              return (
                <button
                  key={`collection-state-${filter.state}`}
                  type="button"
                  className={classNames(
                    'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'border-subtle text-secondary hover:text-foreground hover:border-border'
                  )}
                  onClick={() => setPersistedStateFilter(filter.state)}
                  data-testid={`collection-state-filter-${filter.state}`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={classNames(
                      'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
                      isActive
                        ? 'bg-white text-primary-600 dark:text-primary-500'
                        : 'bg-soft text-muted'
                    )}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        }
      >
        {filteredItems.length > 0 ? (
          <div className="flex flex-col gap-3" data-testid="collection-unit-cards">
            {filteredItems.map((item) => (
              <RosterUnitCardEdit
                key={item.id}
                unit={toRosterUnit(item)}
                rosterId={collection.id}
                basePath="/collections"
                onRemove={handleRemove}
                onDuplicate={handleDuplicate}
                state={item.state}
                dataTestId="collection-unit-card"
              />
            ))}
          </div>
        ) : (
          <RosterEmptyState
            title="No units in this collection"
            description="Add units to start tracking your pile"
            dataTestId="empty-collection-state"
          />
        )}
      </RosterSection>
    </div>
  );
};

const CollectionPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();

  return (
    <AppLayout title="Collection">
      <CollectionPageContent collectionId={collectionId} />
    </AppLayout>
  );
};

export default CollectionPage;
