import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';
import { Plus, ClipboardPlus, Download, RefreshCw } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import PillTabs from '@/components/shared/pill-tabs';
import { Loader, Button, Alert } from '@/components/ui';
import { TAG_VARIANT_CLASSES } from '@/components/ui/tag';
import { RosterSection, RosterEmptyState } from '@/components/shared/roster';
import CollectionUnitCard from '@/routes/collections/_components/collection-unit-card';
import useCollection from '@/hooks/use-collection';
import useRosters from '@/hooks/use-rosters';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import usePersistedTagSelection from '@/hooks/use-persisted-tag-selection';
import { downloadFile } from '@/utils/file';
import { useToast } from '@/contexts/toast/context';
import { CURRENT_GAME_EDITION, type ExportedCollection } from '@/types/export';
import { safeSlug } from '@depot/core/utils/common';
import { useFactionsContext } from '@/contexts/factions/context';
import {
  formatRebindSummaryMessage,
  refreshCollectionDataWithReport
} from '@/utils/refresh-user-data';
import {
  COLLECTION_UNIT_STATES,
  calculateCollectionPoints,
  getCollectionStateCounts
} from '@depot/core/utils/collection';
import { COLLECTION_STATE_META, getCollectionChartCopy } from '@/utils/collection';
import CollectionStateChart from '@/routes/collections/_components/collection-state-chart';
import ListsPanel from '@/routes/rosters/_components/lists-panel';

const COLLECTION_STATE_FILTER_KEY = 'collection-state-filter';

const CollectionPageContent: React.FC<{ collectionId?: string }> = ({ collectionId }) => {
  const navigate = useNavigate();
  const { collection, loading, error, save } = useCollection(collectionId);
  const { rosters } = useRosters();
  const { getDatasheet, getFactionManifest, dataVersion } = useFactionsContext();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const { selection: activeStateFilter, setSelection: setStateFilter } = usePersistedTagSelection<
    depot.CollectionUnitState | 'all'
  >(
    COLLECTION_STATE_FILTER_KEY,
    'all',
    (value) => value === 'all' || COLLECTION_UNIT_STATES.includes(value)
  );
  const [sectionTab, setSectionTab] = useState<'units' | 'lists'>('units');

  const stateCounts = useMemo(
    () => getCollectionStateCounts(collection?.items ?? []),
    [collection]
  );

  const stateFilters = useMemo(
    () =>
      collection
        ? [
            { value: 'all' as const, label: 'All', count: collection.items.length },
            ...COLLECTION_UNIT_STATES.map((state) => ({
              value: state,
              label: COLLECTION_STATE_META[state].label,
              count: stateCounts[state],
              activeClassName: TAG_VARIANT_CLASSES[COLLECTION_STATE_META[state].variant]
            }))
          ]
        : [],
    [collection, stateCounts]
  );

  const points = useMemo(
    () => (collection ? calculateCollectionPoints(collection) : 0),
    [collection]
  );
  const currentDataVersion = dataVersion ?? null;
  const isStale =
    !!currentDataVersion && collection ? collection.dataVersion !== currentDataVersion : false;

  const filteredItems = useMemo(() => {
    if (!collection) {
      return [] as depot.CollectionUnit[];
    }

    if (activeStateFilter === 'all') {
      return collection.items;
    }

    return collection.items.filter((item) => item.state === activeStateFilter);
  }, [activeStateFilter, collection]);

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
      const result = await refreshCollectionDataWithReport({
        collection,
        currentDataVersion,
        getDatasheet,
        getFactionManifest
      });

      await save(result.collection);
      const rebindNote = formatRebindSummaryMessage(result.summary);
      showToast({
        type: rebindNote ? 'warning' : 'success',
        title: 'Collection updated',
        message: rebindNote
          ? `Refreshed with the latest data. ${rebindNote}`
          : 'Refreshed with the latest Wahapedia data.'
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
    if (!source) return;
    await save({
      ...collection,
      items: [...collection.items, { ...source, id: crypto.randomUUID() }]
    });
  };

  const handleExportCollection = async () => {
    if (!collection) return;

    const payload: ExportedCollection = {
      kind: 'collection',
      version: 1,
      dataVersion: collection.dataVersion ?? currentDataVersion ?? null,
      edition: CURRENT_GAME_EDITION,
      collection
    };

    downloadFile(
      `collection-${safeSlug(collection.name)}-${collection.id}.json`,
      JSON.stringify(payload, null, 2)
    );
    showToast({ type: 'success', title: 'Collection exported' });
  };

  const totalUnits = collection?.items.length ?? 0;
  const hasUnits = totalUnits > 0;
  const pageTitle = collection ? `${collection.name} - Collection Tracker` : 'Collection Overview';
  useScrollToHash({ enabled: Boolean(collection) });
  const { heading: collectionHeading } = collection
    ? getCollectionChartCopy(collection, points)
    : { heading: undefined };

  const back = { to: '/armies', label: 'Armies' };

  if (loading) {
    return (
      <AppLayout title={pageTitle} back={back}>
        <Loader />
      </AppLayout>
    );
  }

  if (error || !collection) {
    return (
      <AppLayout title={pageTitle} back={back}>
        <Alert variant="error" title="Unable to load collection">
          {error || 'Collection not found'}
        </Alert>
      </AppLayout>
    );
  }

  const factionLabel = collection.faction?.name || collection.factionSlug || 'Unknown faction';
  const subtitle = `${factionLabel} - ${points} point${points === 1 ? '' : 's'}`;
  const listCount = rosters.filter((roster) => roster.collectionId === collection.id).length;

  return (
    <AppLayout
      title={pageTitle}
      back={back}
      crumbs={[
        { label: 'Armies', to: '/armies' },
        { label: 'Collections', to: '/collections' },
        { label: collection.name }
      ]}
      heading={{ title: collection.name, subtitle }}
      actions={
        hasUnits
          ? [
              {
                icon: <ClipboardPlus size={16} />,
                onClick: () => navigate(`/collections/${collection.id}/new-roster`),
                ariaLabel: 'Create roster from collection',
                'data-testid': 'create-roster-from-collection-button'
              },
              {
                icon: <Download size={16} />,
                onClick: handleExportCollection,
                ariaLabel: 'Export collection',
                'data-testid': 'export-collection-button'
              }
            ]
          : undefined
      }
      footer={
        sectionTab === 'units' ? (
          <Button
            fullWidth
            onClick={() => navigate(`/collections/${collection.id}/add-units`)}
            data-testid="add-collection-units-button"
          >
            <Plus size={16} />
            Add units
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3">
        {isStale ? (
          <Alert variant="warning" title="Collection uses older data">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted">
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

        {hasUnits ? (
          <CollectionStateChart items={collection.items} heading={collectionHeading} />
        ) : null}

        <PillTabs
          tabs={[
            { value: 'units', label: 'Units', count: totalUnits },
            { value: 'lists', label: 'Lists', count: listCount }
          ]}
          active={sectionTab}
          onChange={setSectionTab}
          ariaLabel="Collection sections"
          testIdPrefix="collection-section"
        />

        {sectionTab === 'lists' ? (
          <ListsPanel collectionId={collection.id} />
        ) : (
          <RosterSection
            title="Units"
            count={totalUnits}
            data-testid="collection-units-section"
            className="gap-4"
            belowContent={
              <PillTabs
                tabs={stateFilters}
                active={activeStateFilter}
                onChange={setStateFilter}
                ariaLabel="Filter units by build state"
                testIdPrefix="collection-state-filter"
              />
            }
          >
            {filteredItems.length > 0 ? (
              <div className="flex flex-col gap-4" data-testid="collection-unit-cards">
                {filteredItems.map((item) => (
                  <CollectionUnitCard
                    key={item.id}
                    unit={item}
                    collectionId={collection.id}
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
                dataTestId="empty-collection-state"
                action={{
                  label: 'Add units',
                  onClick: () => navigate(`/collections/${collection.id}/add-units`),
                  icon: <Plus size={14} />,
                  testId: 'empty-collection-add-units'
                }}
              />
            )}
          </RosterSection>
        )}
      </div>
    </AppLayout>
  );
};

const CollectionPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();

  return <CollectionPageContent collectionId={collectionId} />;
};

export default CollectionPage;
