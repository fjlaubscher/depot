import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardPlus, X } from 'lucide-react';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { BackButton } from '@/components/shared';
import { Breadcrumbs, Button, Card, Loader, PageHeader, Tag } from '@/components/ui';
import useCollection from '@/hooks/use-collection';
import { calculateCollectionPoints } from '@/utils/collection';

const SESSION_KEY = 'collection-roster-prefill';

const CollectionNewRoster: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { collection, loading, error } = useCollection(collectionId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const groupedByRole = useMemo(() => {
    if (!collection) return {};
    return collection.items.reduce<Record<string, depot.CollectionUnit[]>>((acc, item) => {
      const role = item.datasheet.role || 'OTHER';
      acc[role] = acc[role] ? [...acc[role], item] : [item];
      return acc;
    }, {});
  }, [collection]);

  const roleKeys = useMemo(() => Object.keys(groupedByRole).sort(), [groupedByRole]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedUnits: depot.RosterUnit[] = useMemo(() => {
    if (!collection) return [];
    return collection.items
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({
        id: crypto.randomUUID(),
        datasheet: item.datasheet,
        modelCost: item.modelCost,
        selectedWargear: item.selectedWargear,
        selectedWargearAbilities: item.selectedWargearAbilities,
        datasheetSlug: item.datasheetSlug ?? item.datasheet.slug
      }));
  }, [collection, selectedIds]);

  const handleCreateRoster = () => {
    if (!collection) return;
    const payload = {
      collectionId: collection.id,
      factionSlug: collection.factionSlug ?? collection.factionId,
      factionId: collection.factionId,
      name: `${collection.name} roster`,
      units: selectedUnits
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    navigate(`/rosters/create?fromCollection=${collection.id}`);
  };

  if (loading) {
    return (
      <AppLayout title="Create Roster">
        <div className="flex flex-col gap-4">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (error || !collection) {
    return (
      <AppLayout title="Create Roster">
        <Card>
          <p className="text-sm text-danger-600">Unable to load collection.</p>
        </Card>
      </AppLayout>
    );
  }

  const points = calculateCollectionPoints(collection);
  const subtitle = `${collection.items.length} unit${collection.items.length === 1 ? '' : 's'} - ${
    collection.faction?.name || collection.factionSlug
  }`;

  const selectedCount = selectedIds.size;

  return (
    <AppLayout title="Create Roster">
      <div className="flex flex-col gap-4">
        <BackButton to={`/collections/${collection.id}`} label="Back" className="md:hidden" />

        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Collections', path: '/collections' },
              { label: collection.name, path: `/collections/${collection.id}` },
              { label: 'Select units', path: `/collections/${collection.id}/new-roster` }
            ]}
          />
        </div>

        <PageHeader
          title="Build roster from collection"
          subtitle={`${collection.name} · ${subtitle}`}
          action={{
            icon: <ClipboardPlus size={16} />,
            onClick: handleCreateRoster,
            ariaLabel: 'Create roster from selected units',
            disabled: selectedCount === 0
          }}
        />

        <Card padding="lg" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag size="sm" variant="primary">
                {selectedCount} selected
              </Tag>
              <span className="text-sm text-subtle">
                {selectedCount > 0
                  ? 'Proceed to roster creation with these units.'
                  : 'Select units to include in your roster.'}
              </span>
            </div>
            {selectedCount > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearSelection}
                className="flex items-center gap-1"
              >
                <X size={14} />
                Clear
              </Button>
            ) : null}
          </div>
          <div className="text-sm text-muted">
            Collection total: {collection.items.length} units · {points} pts
          </div>
        </Card>

        {collection.items.length === 0 ? (
          <Card>
            <p className="text-sm text-subtle">No units in this collection yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {roleKeys.map((role) => (
              <Card key={role} padding="lg" data-testid="collection-role-section">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {role.toUpperCase()} ({groupedByRole[role].length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {groupedByRole[role].map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition ${
                          isSelected
                            ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/30'
                            : 'border-gray-200 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-700'
                        }`}
                        data-testid={`collection-unit-${item.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {item.datasheet.name}
                            </span>
                            <span className="text-xs text-subtle capitalize">{item.state}</span>
                          </div>
                          <Tag size="sm" variant={isSelected ? 'primary' : 'secondary'}>
                            {item.modelCost.cost} pts
                          </Tag>
                        </div>
                        {item.selectedWargear.length > 0 ? (
                          <p className="text-xs text-muted line-clamp-2">
                            {item.selectedWargear.map((wg) => wg.name).join(', ')}
                          </p>
                        ) : (
                          <p className="text-xs text-subtle">Default wargear</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CollectionNewRoster;
