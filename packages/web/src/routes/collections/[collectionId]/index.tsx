import React, { useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { depot } from '@depot/core';
import AppLayout from '@/components/layout';
import {
  PageHeader,
  Breadcrumbs,
  Card,
  Button,
  Loader,
  Alert,
  SelectField,
  Tag,
  Button
} from '@/components/ui';
import { ClipboardList, Plus } from 'lucide-react';
import { BackButton, DatasheetComposition } from '@/components/shared';
import { DatasheetBrowser, DatasheetSelectionCard, DatasheetBrowserSkeleton } from '@/components/shared/datasheet';
import WargearSelectionContainer from '@/routes/rosters/[rosterId]/units/[unitId]/edit/_components/wargear-selection-container';
import WargearAbilitiesSelection from '@/routes/rosters/[rosterId]/units/[unitId]/edit/_components/wargear-abilities-selection';
import ModelCostSelection from '@/routes/rosters/[rosterId]/units/[unitId]/edit/_components/model-cost-selection';
import { RosterSection } from '@/components/shared/roster';
import useCollection from '@/hooks/use-collection';
import useFaction from '@/hooks/use-faction';
import useFactionDatasheets from '@/hooks/use-faction-datasheets';
import { useAppContext } from '@/contexts/app/use-app-context';
import { calculateCollectionPoints, createCollectionUnitFromDatasheet, COLLECTION_UNIT_STATES } from '@/utils/collection';
import { getWargearAbilities } from '@/utils/abilities';

const CollectionDetailPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { collection, loading, error, save, refresh } = useCollection(collectionId);
  const { state: appState } = useAppContext();

  const usePileLabel = appState.settings?.usePileOfShameLabel ?? true;
  const label = usePileLabel ? 'Pile of Shame' : 'Collection';

  const { data: factionData } = useFaction(collection?.factionSlug || undefined);
  const {
    datasheets: factionDatasheets,
    loading: datasheetLoading,
    error: datasheetError
  } = useFactionDatasheets(collection?.factionSlug || undefined, factionData?.datasheets);

  const handleUpdate = async (updater: (current: depot.Collection) => depot.Collection) => {
    if (!collection) return;
    const updated = updater(collection);
    await save(updated);
  };

  const handleAddDatasheet = async (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
    if (!collection) return;
    const newItem = createCollectionUnitFromDatasheet(datasheet, modelCost);
    await handleUpdate((current) => ({
      ...current,
      items: [...current.items, newItem],
      points: { current: current.points.current + (parseInt(modelCost.cost, 10) || 0) }
    }));
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!collection) return;
    await handleUpdate((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId)
    }));
  };

  const handleRename = async (name: string) => {
    if (!collection) return;
    await save({ ...collection, name });
  };

  const handleCreateRoster = async () => {
    navigate(`/rosters/create?fromCollection=${collection?.id}`);
  };

  const showLegends = appState.settings?.showLegends ?? false;
  const showForgeWorld = appState.settings?.showForgeWorld ?? false;
  const datasheetFilters = useMemo(
    () => ({
      showLegends,
      showForgeWorld
    }),
    [showLegends, showForgeWorld]
  );

  const getUnitCount = useCallback(
    (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => {
      if (!collection) return 0;
      return collection.items.filter(
        (item) => item.datasheet.id === datasheet.id && item.modelCost.line === modelCost.line
      ).length;
    },
    [collection]
  );

  const groupedByRole = useMemo(() => {
    if (!collection) return {};
    return collection.items.reduce<Record<string, depot.CollectionUnit[]>>((acc, item) => {
      const role = item.datasheet.role || 'OTHER';
      acc[role] = acc[role] ? [...acc[role], item] : [item];
      return acc;
    }, {});
  }, [collection]);

  const addSectionRef = useRef<HTMLDivElement | null>(null);
  const scrollToAddSection = () => {
    addSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!collectionId) {
    return (
      <AppLayout title={label}>
        <Alert variant="error" title="Invalid collection" />
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title={label}>
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (!collection || error) {
    return (
      <AppLayout title={label}>
        <Alert variant="error" title="Collection not found" description={error || undefined} />
      </AppLayout>
    );
  }

  const points = calculateCollectionPoints(collection);

  return (
    <AppLayout title={collection.name}>
      <div className="flex flex-col gap-4">
        <BackButton to="/collections" label="Back to Collections" className="md:hidden" />

        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label, path: '/collections' },
              { label: collection.name, path: `/collections/${collection.id}/edit` }
            ]}
          />
        </div>

        <PageHeader
          title={collection.name}
          subtitle={`${collection.items.length} unit${collection.items.length === 1 ? '' : 's'} · ${
            collection.faction?.name || collection.factionSlug
          }`}
          action={{
            icon: <ClipboardList size={16} />,
            label: 'Create Roster',
            onClick: handleCreateRoster,
            testId: 'create-roster-from-collection'
          }}
        />

        <Button
          onClick={scrollToAddSection}
          className="w-full flex items-center gap-2"
          data-testid="add-collection-units-button"
        >
          <Plus size={16} />
          Add Units
        </Button>

        <Card>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-body" htmlFor="collection-name-input">
              Name
            </label>
            <input
              id="collection-name-input"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-foreground"
              value={collection.name}
              onChange={(e) => handleRename(e.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-subtle">
              <Tag variant="secondary" size="sm">
                {collection.items.length} units
              </Tag>
              <Tag variant="primary" size="sm">
                {points} pts
              </Tag>
            </div>
          </div>
        </Card>

        {datasheetError ? (
          <Alert variant="error" title="Unable to load datasheets" description={datasheetError} />
        ) : null}

        <Card ref={addSectionRef}>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">Add Units</h3>
            {datasheetLoading ? (
              <DatasheetBrowserSkeleton />
            ) : (
              <DatasheetBrowser
                datasheets={factionDatasheets}
                searchPlaceholder="Search by unit name..."
                emptyStateMessage="No units available for this faction."
                filters={datasheetFilters}
                renderDatasheet={(datasheet) => (
                  <DatasheetSelectionCard
                    datasheet={datasheet}
                    onAdd={(d, cost) => void handleAddDatasheet(d, cost)}
                    getUnitCount={getUnitCount}
                    addLabel="Add to Collection"
                  />
                )}
              />
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {collection.items.length === 0 ? (
            <Card>
              <p className="text-sm text-subtle">No units added yet.</p>
            </Card>
          ) : (
            collection.items.map((item) => {
              const wargearAbilities = getWargearAbilities(item.datasheet.abilities ?? []);
              return (
                <Card key={item.id} data-testid={`collection-item-${item.id}`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <h3 className="text-base font-semibold text-foreground">{item.datasheet.name}</h3>
                          <p className="text-sm text-subtle">{item.modelCost.description}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => void handleRemoveItem(item.id)}>
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-subtle">
                        <Tag size="sm" variant="primary">
                          {parseInt(item.modelCost.cost, 10) || 0} pts
                        </Tag>
                        <Tag size="sm" variant="secondary" className="capitalize">
                          {item.state}
                        </Tag>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                      <div className="flex flex-col gap-4">
                        {item.datasheet.modelCosts.length > 1 ? (
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-body">Unit Size</label>
                            <ModelCostSelection
                              unit={{
                                id: item.id,
                                datasheet: item.datasheet,
                                modelCost: item.modelCost,
                                selectedWargear: item.selectedWargear,
                                selectedWargearAbilities: item.selectedWargearAbilities,
                                datasheetSlug: item.datasheetSlug
                              }}
                              selectedModelCost={item.modelCost}
                              onModelCostChange={(next) =>
                                void handleUpdate((current) => ({
                                  ...current,
                                  items: current.items.map((unit) =>
                                    unit.id === item.id ? { ...unit, modelCost: next } : unit
                                  )
                                }))
                              }
                            />
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-body">State</label>
                          <SelectField
                            options={COLLECTION_UNIT_STATES.map((state) => ({
                              value: state,
                              label: state
                            }))}
                            value={item.state}
                            onChange={(e) =>
                              void handleUpdate((current) => ({
                                ...current,
                                items: current.items.map((unit) =>
                                  unit.id === item.id ? { ...unit, state: e.target.value as depot.CollectionUnitState } : unit
                                )
                              }))
                            }
                          />
                        </div>

                        <DatasheetComposition
                          composition={item.datasheet.unitComposition}
                          loadout={item.datasheet.loadout}
                          transport={item.datasheet.transport}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <Card padding="md">
                          <div className="flex flex-col gap-2">
                            <h4 className="font-semibold text-foreground">Wargear</h4>
                            <WargearSelectionContainer
                              unit={{
                                id: item.id,
                                datasheet: item.datasheet,
                                modelCost: item.modelCost,
                                selectedWargear: item.selectedWargear,
                                selectedWargearAbilities: item.selectedWargearAbilities,
                                datasheetSlug: item.datasheetSlug
                              }}
                              selectedWargear={item.selectedWargear}
                              onWargearChange={(wargear) =>
                                void handleUpdate((current) => ({
                                  ...current,
                                  items: current.items.map((unit) =>
                                    unit.id === item.id ? { ...unit, selectedWargear: wargear } : unit
                                  )
                                }))
                              }
                            />
                          </div>
                        </Card>

                        <Card padding="md">
                          <div className="flex flex-col gap-2">
                            <h4 className="font-semibold text-foreground">Wargear Abilities</h4>
                            <WargearAbilitiesSelection
                              abilities={wargearAbilities}
                              selected={item.selectedWargearAbilities ?? []}
                              onChange={(abilities) =>
                                void handleUpdate((current) => ({
                                  ...current,
                                  items: current.items.map((unit) =>
                                    unit.id === item.id ? { ...unit, selectedWargearAbilities: abilities } : unit
                                  )
                                }))
                              }
                            />
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CollectionDetailPage;
