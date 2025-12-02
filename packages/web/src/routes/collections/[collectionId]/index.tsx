import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ClipboardPlus, RefreshCw } from 'lucide-react';
import type { depot } from '@depot/core';
import classNames from 'classnames';

import AppLayout from '@/components/layout';
import { BackButton } from '@/components/shared';
import { PageHeader, Loader, Breadcrumbs, Button, Alert } from '@/components/ui';
import { RosterSection, RosterEmptyState, RosterUnitList } from '@/components/shared/roster';
import CollectionUnitCard from '@/routes/collections/_components/collection-unit-card';
import useCollection from '@/hooks/use-collection';
import { useDocumentTitle } from '@/hooks/use-document-title';
import usePersistedTagSelection from '@/hooks/use-persisted-tag-selection';
import useDownloadFile from '@/hooks/use-download-file';
import { useToast } from '@/contexts/toast/use-toast-context';
import type { ExportedCollection } from '@/types/export';
import { safeSlug } from '@/utils/strings';
import ExportButton from '@/components/shared/export-button';
import { useAppContext } from '@/contexts/app/use-app-context';
import { refreshCollectionData } from '@/utils/refresh-user-data';
import {
  COLLECTION_STATE_META,
  COLLECTION_UNIT_STATES,
  calculateCollectionPoints,
  getCollectionStateCounts,
  getCollectionChartCopy
} from '@/utils/collection';
import CollectionStateChart from '@/routes/collections/_components/collection-state-chart';

const COLLECTION_STATE_FILTER_KEY = 'collection-state-filter';

const CollectionPageContent: React.FC<{ collectionId?: string }> = ({ collectionId }) => {
  const navigate = useNavigate();
  const { collection, loading, error, save } = useCollection(collectionId);
  const { state: appState, getDatasheet } = useAppContext();
  const { showToast } = useToast();
  const downloadFile = useDownloadFile();
  const [refreshing, setRefreshing] = useState(false);
  const {
    selection: persistedStateFilter,
    setSelection: setPersistedStateFilter,
    clearSelection: clearPersistedStateFilter
  } = usePersistedTagSelection<depot.CollectionUnitState | 'all'>(
    COLLECTION_STATE_FILTER_KEY,
    'all',
    (value) => value === 'all' || COLLECTION_UNIT_STATES.includes(value)
  );

  const stateCounts = useMemo(
    () => getCollectionStateCounts(collection?.items ?? []),
    [collection]
  );

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
  const currentDataVersion = appState.dataVersion ?? null;
  const isStale =
    !!currentDataVersion && collection ? collection.dataVersion !== currentDataVersion : false;

  const toRosterUnit = (item: depot.CollectionUnit): depot.RosterUnit => ({
    id: item.id,
    datasheet: item.datasheet,
    modelCost: item.modelCost,
    selectedWargear: item.selectedWargear,
    selectedWargearAbilities: item.selectedWargearAbilities,
    datasheetSlug: item.datasheetSlug
  });

  const filteredItems = useMemo(() => {
    if (!collection) {
      return [] as depot.CollectionUnit[];
    }

    if (activeStateFilter === 'all') {
      return collection.items;
    }

    return collection.items.filter((item) => item.state === activeStateFilter);
  }, [activeStateFilter, collection]);

  const filteredRosterUnits = useMemo(
    () => filteredItems.map((item) => toRosterUnit(item)),
    [filteredItems]
  );

  const handleRefreshCollectionData = async () => {
    if (refreshing || !collection) return;
    if (!currentDataVersion) {
      showToast({
        type: 'warning',
        title: 'No data version detected',
        message: 'Unable to refresh because the current data version is unknown.'
      });
      return;
    }

    setRefreshing(true);
    try {
      const updatedCollection = await refreshCollectionData({
        collection,
        currentDataVersion,
        getDatasheet
      });

      await save(updatedCollection);
      showToast({
        type: 'success',
        title: 'Collection updated',
        message: 'Refreshed with the latest Wahapedia data.'
      });
    } catch (err) {
      console.error('Failed to refresh collection data', err);
      showToast({
        type: 'error',
        title: 'Refresh failed',
        message: 'Could not refresh this collection. Please try again.'
      });
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleExportCollection = async () => {
    if (!collection) return;

    const dataVersion = collection.dataVersion ?? appState.dataVersion ?? null;

    const payload: ExportedCollection = {
      kind: 'collection',
      version: 1,
      dataVersion,
      collection
    };

    downloadFile(
      `collection-${safeSlug(collection.name)}-${collection.id}.json`,
      JSON.stringify(payload, null, 2)
    );
    showToast({ type: 'success', title: 'Collection exported' });
  };

  const totalUnits = collection?.items.length ?? 0;
  const pageTitle = collection ? `${collection.name} - Collection Tracker` : 'Collection Overview';
  useDocumentTitle(pageTitle);
  const { heading: collectionHeading, subheading: collectionSubheading } = collection
    ? getCollectionChartCopy(collection, points)
    : { heading: undefined, subheading: undefined };

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

  const factionLabel = collection.faction?.name || collection.factionSlug || 'Unknown faction';
  const subtitle = `${factionLabel} - ${points} point${points === 1 ? '' : 's'}`;

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
        action={{
          icon: <Plus size={16} />,
          onClick: handleAddUnits,
          ariaLabel: 'Add units',
          testId: 'add-collection-units-button'
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleCreateRoster}
          variant="secondary"
          className="flex items-center gap-2"
          data-testid="create-roster-from-collection-button"
        >
          <ClipboardPlus size={16} />
          Create Roster
        </Button>
        <ExportButton onClick={handleExportCollection} testId="export-collection-button" />
      </div>

      {isStale ? (
        <Alert variant="warning" title="Collection uses older data">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-secondary">
              Refresh to pull the latest Wahapedia data for these units.
            </span>
            <div>
              <Button
                variant="secondary"
                onClick={() => void handleRefreshCollectionData()}
                disabled={refreshing}
                data-testid="refresh-collection-data"
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {refreshing ? 'Refreshing…' : 'Refresh with latest data'}
              </Button>
            </div>
          </div>
        </Alert>
      ) : null}

      <CollectionStateChart
        items={collection.items}
        heading={collectionHeading}
        subheading={collectionSubheading}
      />

      <RosterSection
        title={`Units (${totalUnits})`}
        data-testid="collection-units-section"
        className="gap-4"
        belowContent={
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
        {filteredRosterUnits.length > 0 ? (
          <RosterUnitList
            units={filteredRosterUnits}
            dataTestId="collection-unit-cards"
            renderUnit={(unit) => (
              <CollectionUnitCard
                key={unit.id}
                unit={unit}
                collectionId={collection.id}
                onRemove={handleRemove}
                onDuplicate={handleDuplicate}
                state={collection.items.find((item) => item.id === unit.id)?.state}
                dataTestId="collection-unit-card"
              />
            )}
          />
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
    <AppLayout title="Collection Overview">
      <CollectionPageContent collectionId={collectionId} />
    </AppLayout>
  );
};

export default CollectionPage;
