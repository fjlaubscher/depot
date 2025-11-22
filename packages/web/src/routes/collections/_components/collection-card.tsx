import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import { Trash2, Pencil, Copy } from 'lucide-react';

import { Card, ActionGroup, PointsTag, Tag } from '@/components/ui';
import { COLLECTION_STATE_META } from '@/utils/collection';
import { calculateCollectionPoints } from '@/utils/collection';

interface CollectionCardProps {
  collection: depot.Collection;
  onDelete: (collectionId: string) => Promise<void>;
  onDuplicate: (collection: depot.Collection) => Promise<void>;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleView = () => {
    navigate(`/collections/${collection.id}`);
  };

  const handleEdit = () => {
    navigate(`/collections/${collection.id}`);
  };

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      await onDuplicate(collection);
    } catch (error) {
      console.error('Failed to duplicate collection:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(collection.id);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const points = calculateCollectionPoints(collection);

  const stateSummary = collection.items.reduce<Record<depot.CollectionUnitState, number>>(
    (acc, item) => {
      acc[item.state] = (acc[item.state] ?? 0) + 1;
      return acc;
    },
    {} as Record<depot.CollectionUnitState, number>
  );

  return (
    <Card
      interactive
      className="flex h-full cursor-pointer flex-col gap-4"
      onClick={handleView}
      data-testid={`collection-card-${collection.id}`}
    >
      <Card.Header className="items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Card.Title as="h3" className="truncate text-base font-semibold sm:text-lg">
            {collection.name}
          </Card.Title>
          <Card.Subtitle as="span" className="truncate text-sm capitalize">
            {collection.faction?.name || collection.factionSlug || collection.factionId}
          </Card.Subtitle>
        </div>
        <PointsTag points={points} className="whitespace-nowrap" />
      </Card.Header>

      <Card.Content separated className="flex flex-wrap items-center gap-2 text-xs text-subtle">
        <Tag size="sm" variant="primary">
          {collection.items.length} {collection.items.length === 1 ? 'unit' : 'units'}
        </Tag>
        {Object.entries(stateSummary).length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {Object.entries(stateSummary).map(([state, count]) => {
              const meta = COLLECTION_STATE_META[state as depot.CollectionUnitState];
              return (
                <Tag key={state} size="sm" variant={meta?.variant ?? 'ghost'}>
                  {meta?.label ?? state}: {count}
                </Tag>
              );
            })}
          </div>
        ) : null}
      </Card.Content>

      <Card.Footer align="end">
        <ActionGroup
          spacing="tight"
          actions={[
            {
              icon: <Pencil size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                handleEdit();
              },
              ariaLabel: 'Edit collection',
              variant: 'primary'
            },
            {
              icon: <Copy size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                void handleDuplicate();
              },
              ariaLabel: 'Duplicate collection',
              variant: 'secondary',
              disabled: isDuplicating
            },
            {
              icon: <Trash2 size={16} />,
              onClick: (event) => {
                event?.stopPropagation();
                void handleDelete();
              },
              ariaLabel: 'Delete collection',
              variant: 'danger',
              disabled: isDeleting
            }
          ]}
        />
      </Card.Footer>
    </Card>
  );
};

export default CollectionCard;
